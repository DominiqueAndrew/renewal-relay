import test from "node:test";
import assert from "node:assert/strict";
import { getRunPresentation } from "../public/run-state.js";
import { verifyRuntime } from "../scripts/verify-runtime.mjs";
import { findSecretPatterns, scanTrackedFiles } from "../scripts/check-secrets.mjs";

test("failed runs are visibly safe and retryable", () => {
  const state = getRunPresentation({ status: "failed", timeline: [{ state: "failed" }] });
  assert.equal(state.heading, "Run stopped safely");
  assert.equal(state.progressText, "Run stopped safely · no actions staged");
  assert.equal(state.buttonLabel, "Retry safely");
  assert.equal(state.showDecision, false);
  assert.equal(state.showActions, false);
});

test("completed runs alone reveal the decision and staged actions", () => {
  const state = getRunPresentation({ status: "complete", timeline: [{}, {}, {}, {}], decision: {}, actions: [{ id: "one" }] });
  assert.equal(state.heading, "Renewal packet ready");
  assert.equal(state.progress, 100);
  assert.equal(state.buttonLabel, "Run again");
  assert.equal(state.showDecision, true);
  assert.equal(state.showActions, true);
});

test("queued and running states keep the operator from starting a duplicate run", () => {
  for (const status of ["queued", "running"]) {
    const state = getRunPresentation({ status });
    assert.equal(state.buttonLabel, "Agent is running…");
    assert.equal(state.showDecision, false);
    assert.equal(state.showActions, false);
  }
});

test("runtime proof is blocked without a supplied URL and never emits credentials", async () => {
  const result = await verifyRuntime();
  assert.deepEqual(result, { ok: false, status: "blocked", reason: "CLOUD_RUN_URL is required" });
});

test("runtime proof verifies the public health contract", async () => {
  const result = await verifyRuntime("https://renewal-relay.example/?token=redacted", async (url) => {
    assert.equal(url, "https://renewal-relay.example/api/health");
    return { status: 200, json: async () => ({ ok: true, service: "renewal-relay", provider: "not copied" }) };
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, "verified");
  assert.equal(result.service, "renewal-relay");
  assert.equal(result.url, "https://renewal-relay.example/api/health");
  assert.equal(Object.hasOwn(result, "token"), false);
});

test("runtime proof fails closed on a non-contract response", async () => {
  const result = await verifyRuntime("http://127.0.0.1:8080", async () => ({
    status: 503,
    json: async () => ({ ok: false, service: "other-service" })
  }));
  assert.equal(result.ok, false);
  assert.equal(result.status, "failed");
  assert.match(result.reason, /health response/);
});

test("secret scan detects high-confidence token formats without echoing values", async () => {
  assert.deepEqual(findSecretPatterns("placeholder only"), []);
  assert.deepEqual(findSecretPatterns(["AIza", "Sy123456789012345678901"].join("")), ["google-api-key"]);
  const findings = await scanTrackedFiles(["README.md", "fixture.env"], async (fileName) => fileName === "README.md" ? "safe documentation" : ["-----BEGIN ", "PRIVATE KEY-----"].join(""));
  assert.deepEqual(findings, [{ file: "fixture.env", line: 1, pattern: "private-key" }]);
  assert.equal(Object.hasOwn(findings[0], "value"), false);
});
