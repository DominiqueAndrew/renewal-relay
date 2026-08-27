import test from "node:test";
import assert from "node:assert/strict";
import { getRunPresentation } from "../public/run-state.js";

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
