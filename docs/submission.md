# Submission draft — Renewal Relay

## Project title

Renewal Relay

## Category

Taskmaster

## One-line pitch

Renewal Relay turns a renewal notice into a policy-checked, human-approved action packet before the deadline disappears.

## Description

Renewal deadlines arrive as inbox noise, but the cost of missing one is real. Renewal Relay reads one synthetic renewal notice, extracts the facts with Gemini 3.5 Flash, checks an explicit company policy in deterministic code, and stages the work needed to move forward: a calendar hold, an approval task, a vendor reply draft, and a durable audit record.

This is autonomous action with a boundary. The agent runs as a background job, makes the routing decision, and prepares the next steps without requiring the operator to translate a summary into more work. It does not send an external message, cancel a contract, or approve a financial commitment without a human. If a renewal is above the threshold or a fact is missing, it escalates with the reason visible.

## Technologies

Gemini 3.5 Flash through the Google GenAI SDK, Node.js, Google Cloud Run, and Firestore. The frontend is a small vanilla HTML/CSS/JavaScript UI. Local runs use synthetic data and a deterministic extractor when no Gemini API key is available.

## Findings and learnings

- The model is best used for bounded fact extraction; policy decisions belong in code where the threshold and failure behavior are inspectable.
- A complete agent demo needs visible side effects, not only a generated answer. The action packet makes each side effect and its status explicit.
- A safe default can still be useful: the system routes high-value renewals to a human instead of silently guessing or auto-approving.
- Async progress and an audit trail make the agent’s behavior legible to both an operator and a reviewer.

## Demo video outline

Keep the public video under four minutes:

1. Show the $1,440 ZenCloud renewal notice and its September 5 cancellation deadline.
2. Start the background run and let the timeline show intake, extraction, policy, and actions.
3. Highlight that the amount exceeds the $1,000 review threshold, so the result is REVIEW_REQUIRED.
4. Show the calendar hold, approval task, non-sendable vendor draft, and audit record.
5. Show the Cloud Run dashboard and the deployed service /api/health response.
6. Close with the guardrails and the architecture boundary.

## Submission checklist

- [x] Repository with reproducible README
- [x] Architecture diagram
- [x] Gemini 3.5+ integration through a Google agent framework
- [x] Cloud Run and Firestore deployment path
- [x] Synthetic, repeatable local demo
- [x] Targeted automated tests
- [ ] Public hosted URL
- [ ] Public demo video on YouTube or Vimeo
- [ ] Final Devpost submission confirmation by the human
