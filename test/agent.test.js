import test from "node:test";
import assert from "node:assert/strict";
import { createDemoAdapter, createGeminiAdapter, validateExtraction } from "../src/ai/gemini-adapter.js";
import { createRenewalAgent, fingerprintNotice, SAMPLE_NOTICE } from "../src/agent/renewal-agent.js";
import { DEFAULT_POLICY, evaluateRenewal } from "../src/domain/policy.js";

test("demo adapter extracts the synthetic renewal notice without inventing facts", async () => {
  const extraction = await createDemoAdapter().extract(SAMPLE_NOTICE);
  assert.equal(extraction.vendor, "ZenCloud");
  assert.equal(extraction.amount, 1440);
  assert.equal(extraction.renewalDate, "2026-09-12");
  assert.equal(extraction.cancelByDate, "2026-09-05");
  assert.equal(extraction.missingFacts.length, 0);
});

test("Gemini provider metadata reports the configured model without making a request", () => {
  const adapter = createGeminiAdapter({ apiKey: "synthetic-test-key", model: "gemini-3.5-flash" });
  assert.match(adapter.provider, /gemini-3\.5-flash/);
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
  assert.match(run.sourceFingerprint, /^[a-f0-9]{64}$/);
  assert.equal(run.sourceFingerprint, fingerprintNotice(SAMPLE_NOTICE));
  assert.equal(run.actions.find((item) => item.id === "audit_record").metadata.sourceFingerprint, run.sourceFingerprint);
  assert.deepEqual(run.actions.map((item) => item.metadata.idempotencyKey), [
    "renewal-relay:run_test:calendar_hold",
    "renewal-relay:run_test:approval_task",
    "renewal-relay:run_test:vendor_draft",
    "renewal-relay:run_test:audit_record"
  ]);
  assert.ok(run.actions.every((item) => item.metadata.execution === "record_only" && item.metadata.retrySafe === true));
  const replay = await agent.run(SAMPLE_NOTICE, { runId: "run_test", onProgress: () => {} });
  assert.deepEqual(replay.actions.map((item) => item.metadata.idempotencyKey), run.actions.map((item) => item.metadata.idempotencyKey));
  assert.equal(replay.sourceFingerprint, run.sourceFingerprint);
  assert.match(run.guardrails.join(" "), /No auto-cancel/);
  assert.ok(events.length >= 5);
});

test("source fingerprints are stable for the same notice and change with content", () => {
  const sameNotice = { ...SAMPLE_NOTICE };
  const changedNotice = { ...SAMPLE_NOTICE, body: SAMPLE_NOTICE.body + " Updated." };
  assert.equal(fingerprintNotice(sameNotice), fingerprintNotice(SAMPLE_NOTICE));
  assert.notEqual(fingerprintNotice(changedNotice), fingerprintNotice(SAMPLE_NOTICE));
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

test("extraction validator rejects model-controlled action fields and malformed dates", () => {
  assert.throws(() => validateExtraction({
    vendor: "ZenCloud",
    plan: "Pro workspace",
    amount: 1440,
    currency: "USD",
    renewalDate: "2026-09-12",
    confidence: 0.96,
    missingFacts: [],
    actions: [{ type: "send_email" }]
  }), /unexpected field actions/);
  assert.throws(() => validateExtraction({
    vendor: "ZenCloud",
    plan: "Pro workspace",
    amount: 1440,
    currency: "USD",
    renewalDate: "2026-02-30",
    confidence: 0.96,
    missingFacts: []
  }), /real ISO/);
  assert.throws(() => validateExtraction({
    vendor: "ZenCloud",
    plan: "Pro workspace",
    amount: 1440,
    currency: "USD",
    renewalDate: "2026-09-12",
    confidence: 1.1,
    missingFacts: []
  }), /confidence must be a finite non-negative number/);
  assert.throws(() => validateExtraction({
    vendor: "ZenCloud",
    plan: "Pro workspace",
    amount: 1440,
    currency: "USD",
    renewalDate: "2026-09-12",
    cancelByDate: "",
    owner: "",
    ownerEmail: "",
    confidence: 0.96,
    missingFacts: ["renewalDate", "cancelByDate", "owner", "ownerEmail"]
  }), /missingFacts marks present field renewalDate/);
});

test("agent fails closed when an adapter returns an unsafe extraction shape", async () => {
  const agent = createRenewalAgent({
    adapter: {
      provider: "adversarial test adapter",
      extract: async () => ({
        vendor: "ZenCloud",
        plan: "Pro workspace",
        amount: 1440,
        currency: "USD",
        renewalDate: "2026-09-12",
        confidence: 0.96,
        missingFacts: [],
        actions: [{ type: "send_email" }]
      })
    },
    stepDelayMs: 0,
    clock: () => new Date("2026-08-27T12:00:00Z")
  });
  const run = await agent.run(SAMPLE_NOTICE, { runId: "run_unsafe", onProgress: () => {} });
  assert.equal(run.status, "failed");
  assert.match(run.error, /unexpected field actions/);
  assert.equal(run.actions, undefined);
});
