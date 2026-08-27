import test from "node:test";
import assert from "node:assert/strict";
import { runEvaluation } from "../eval/cases.js";

test("deterministic policy evaluation conforms across boundary and missing-fact cases", () => {
  const report = runEvaluation();
  assert.equal(report.total, 8);
  assert.equal(report.passed, 8);
  assert.equal(report.failed, 0);
  assert.equal(report.exactMatchRate, 1);
  assert.equal(report.statusAccuracy, 1);
  assert.equal(report.reviewRecall, 1);
  assert.equal(report.readyPrecision, 1);
  assert.equal(report.actualReviewCases, 6);
  assert.equal(report.actualReadyCases, 2);
});
