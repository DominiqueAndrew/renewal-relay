const DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_POLICY = Object.freeze({
  currency: "USD",
  reviewWindowDays: 7,
  amountReviewThreshold: 1000,
  owner: "Samira Chen",
  ownerEmail: "samira@example.com",
  timezone: "America/New_York"
});

function daysUntil(dateText, now) {
  const date = new Date(dateText + "T12:00:00Z");
  return Math.ceil((date.getTime() - now.getTime()) / DAY_MS);
}

export function evaluateRenewal(extraction, policy = DEFAULT_POLICY, now = new Date()) {
  const checks = [];
  const amount = Number(extraction.amount) || 0;
  const daysToRenewal = daysUntil(extraction.renewalDate, now);

  checks.push({
    id: "amount",
    label: "Amount within auto-review policy",
    passed: amount <= policy.amountReviewThreshold,
    detail: (extraction.currency || policy.currency) + " " + amount.toLocaleString() + " " + (amount <= policy.amountReviewThreshold ? "≤" : ">") + " " + policy.currency + " " + policy.amountReviewThreshold.toLocaleString() + " threshold"
  });
  checks.push({
    id: "deadline",
    label: "Enough time before renewal",
    passed: daysToRenewal >= policy.reviewWindowDays,
    detail: daysToRenewal + " days until renewal; policy expects at least " + policy.reviewWindowDays
  });
  checks.push({
    id: "cancel-window",
    label: "Cancellation window is explicit",
    passed: Boolean(extraction.cancelByDate),
    detail: extraction.cancelByDate ? "Cancel by " + extraction.cancelByDate : "No cancellation deadline found"
  });
  checks.push({
    id: "owner",
    label: "Account owner is known",
    passed: Boolean(extraction.ownerEmail),
    detail: extraction.ownerEmail || "No owner in source notice"
  });

  const passed = checks.filter((check) => check.passed).length;
  const requiresHumanReview = checks.some((check) => !check.passed) || amount > policy.amountReviewThreshold;
  const risk = amount > policy.amountReviewThreshold || daysToRenewal < policy.reviewWindowDays ? "high" : "guarded";

  return {
    status: requiresHumanReview ? "REVIEW_REQUIRED" : "READY_FOR_APPROVAL",
    risk,
    checks,
    passedChecks: passed,
    totalChecks: checks.length,
    rationale: requiresHumanReview
      ? "The agent prepared every reversible next step, but a human must approve a financial commitment or resolve a missing fact."
      : "The notice is complete and inside policy. The agent prepared an approval packet without sending or cancelling anything."
  };
}
