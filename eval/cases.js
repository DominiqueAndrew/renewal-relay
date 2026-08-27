import { DEFAULT_POLICY, evaluateRenewal } from "../src/domain/policy.js";

export const EVALUATION_NOW = new Date("2026-08-27T12:00:00Z");

const ownerEmail = "samira@example.com";

export const EVALUATION_CASES = [
  {
    id: "high_amount_complete",
    extraction: { amount: 1440, currency: "USD", renewalDate: "2026-09-12", cancelByDate: "2026-09-05", ownerEmail },
    expected: { status: "REVIEW_REQUIRED", risk: "high", passedChecks: 3, failedChecks: ["amount"] }
  },
  {
    id: "within_policy_complete",
    extraction: { amount: 800, currency: "USD", renewalDate: "2026-09-12", cancelByDate: "2026-09-05", ownerEmail },
    expected: { status: "READY_FOR_APPROVAL", risk: "guarded", passedChecks: 4, failedChecks: [] }
  },
  {
    id: "amount_threshold_boundary",
    extraction: { amount: 1000, currency: "USD", renewalDate: "2026-09-12", cancelByDate: "2026-09-05", ownerEmail },
    expected: { status: "READY_FOR_APPROVAL", risk: "guarded", passedChecks: 4, failedChecks: [] }
  },
  {
    id: "missing_cancellation_deadline",
    extraction: { amount: 800, currency: "USD", renewalDate: "2026-09-12", cancelByDate: "", ownerEmail },
    expected: { status: "REVIEW_REQUIRED", risk: "guarded", passedChecks: 3, failedChecks: ["cancel-window"] }
  },
  {
    id: "urgent_deadline",
    extraction: { amount: 800, currency: "USD", renewalDate: "2026-08-30", cancelByDate: "2026-08-28", ownerEmail },
    expected: { status: "REVIEW_REQUIRED", risk: "high", passedChecks: 3, failedChecks: ["deadline"] }
  },
  {
    id: "missing_owner",
    extraction: { amount: 800, currency: "USD", renewalDate: "2026-09-12", cancelByDate: "2026-09-05", ownerEmail: "" },
    expected: { status: "REVIEW_REQUIRED", risk: "guarded", passedChecks: 3, failedChecks: ["owner"] }
  },
  {
    id: "missing_renewal_date",
    extraction: { amount: 800, currency: "USD", renewalDate: "", cancelByDate: "2026-09-05", ownerEmail },
    expected: { status: "REVIEW_REQUIRED", risk: "high", passedChecks: 3, failedChecks: ["deadline"] }
  },
  {
    id: "multiple_risks",
    extraction: { amount: 2200, currency: "USD", renewalDate: "2026-08-30", cancelByDate: "", ownerEmail: "" },
    expected: { status: "REVIEW_REQUIRED", risk: "high", passedChecks: 0, failedChecks: ["amount", "deadline", "cancel-window", "owner"] }
  }
];

export function runEvaluation(now = EVALUATION_NOW, policy = DEFAULT_POLICY) {
  const cases = EVALUATION_CASES.map(({ id, extraction, expected }) => {
    const decision = evaluateRenewal(extraction, policy, now);
    const failedChecks = decision.checks.filter((check) => !check.passed).map((check) => check.id);
    const actual = { status: decision.status, risk: decision.risk, passedChecks: decision.passedChecks, failedChecks };
    const exactMatch = JSON.stringify(actual) === JSON.stringify(expected);
    return { id, expected, actual, exactMatch };
  });
  const passed = cases.filter((item) => item.exactMatch).length;
  const reviewCases = cases.filter((item) => item.expected.status === "REVIEW_REQUIRED");
  const readyCases = cases.filter((item) => item.expected.status === "READY_FOR_APPROVAL");
  const actualReadyCases = cases.filter((item) => item.actual.status === "READY_FOR_APPROVAL");
  const actualReviewCases = cases.filter((item) => item.actual.status === "REVIEW_REQUIRED");
  return {
    evaluation: "deterministic-policy-conformance",
    now: now.toISOString(),
    total: cases.length,
    passed,
    failed: cases.length - passed,
    exactMatchRate: passed / cases.length,
    statusAccuracy: cases.filter((item) => item.expected.status === item.actual.status).length / cases.length,
    reviewRecall: reviewCases.filter((item) => item.actual.status === "REVIEW_REQUIRED").length / reviewCases.length,
    readyPrecision: actualReadyCases.length ? actualReadyCases.filter((item) => item.expected.status === "READY_FOR_APPROVAL").length / actualReadyCases.length : null,
    expectedReviewCases: reviewCases.length,
    expectedReadyCases: readyCases.length,
    actualReviewCases: actualReviewCases.length,
    actualReadyCases: actualReadyCases.length,
    cases
  };
}
