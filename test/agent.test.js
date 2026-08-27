import test from "node:test";
import assert from "node:assert/strict";
import { createDemoAdapter } from "../src/ai/gemini-adapter.js";
import { createRenewalAgent, SAMPLE_NOTICE } from "../src/agent/renewal-agent.js";
import { DEFAULT_POLICY, evaluateRenewal } from "../src/domain/policy.js";

test("demo adapter extracts the synthetic renewal notice without inventing facts", async () => {
  const extraction = await createDemoAdapter().extract(SAMPLE_NOTICE);
  assert.equal(extraction.vendor, "ZenCloud");
  assert.equal(extraction.amount, 1440);
  assert.equal(extraction.renewalDate, "2026-09-12");
  assert.equal(extraction.cancelByDate, "2026-09-05");
  assert.equal(extraction.missingFacts.length, 0);
});

test("policy escalates a renewal above the financial threshold", () => {
  const decision = evaluateRenewal({ amount: 1440, currency: "USD", renewalDate: "2026-09-12", cancelByDate: "2026-09-05", ownerEmail: "samira@example.com" }, DEFAULT_POLICY, new Date("2026-08-27T12:00:00Z"));
  assert.equal(decision.status, "REVIEW_REQUIRED");
  assert.equal(decision.risk, "high");
  assert.equal(decision.checks.find((check) => check.id === "amount").passed, false);
});

test("agent completes the full action packet and records guardrails", async () => {
  const events = [];
  const agent = createRenewalAgent({ adapter: createDemoAdapter(), stepDelayMs: 0, clock: () => new Date("2026-08-27T12:00:00Z") });
  const run = await agent.run(SAMPLE_NOTICE, { runId: "run_test", onProgress: (event) => events.push(event) });
  assert.equal(run.status, "complete");
  assert.equal(run.decision.status, "REVIEW_REQUIRED");
  assert.equal(run.decision.passedChecks, 3);
  assert.equal(run.actions.length, 4);
  assert.equal(run.actions.find((item) => item.id === "vendor_draft").metadata.sendable, false);
  assert.match(run.guardrails.join(" "), /No auto-cancel/);
  assert.ok(events.length >= 5);
});

test("agent fails closed when extraction is unavailable and stages no actions", async () => {
  const events = [];
  const agent = createRenewalAgent({
    adapter: { provider: "failing test adapter", extract: async () => { throw new Error("provider unavailable"); } },
    stepDelayMs: 0,
    clock: () => new Date("2026-08-27T12:00:00Z")
  });
  const run = await agent.run(SAMPLE_NOTICE, { runId: "run_failed", onProgress: (event) => events.push(event) });
  assert.equal(run.status, "failed");
  assert.equal(run.actions, undefined);
  assert.match(run.error, /provider unavailable/);
  assert.equal(run.timeline.at(-1).state, "failed");
  assert.ok(events.some((event) => event.status === "failed"));
});
