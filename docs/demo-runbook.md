# Renewal Relay demo runbook

Target audience: a judge or operator watching the three-minute vertical slice.
The local path is deterministic and synthetic; the final public recording must
replace the local proof with a real, authorized Cloud Run URL and visible runtime
evidence before submission.

Record the final pass in the [demo capture receipt](demo-capture-receipt.md); it
keeps local rehearsal evidence separate from live runtime and submission status.

## Local rehearsal

```bash
npm ci
npm test
npm run eval
npm run check
npm start
```

Open `http://localhost:8080` and click **Run Renewal Relay**.

## Story beats

1. Start on the source notice: ZenCloud renews on September 12 for `$1,440` and
   cancellation is available until September 5.
2. Click **Run Renewal Relay**. Let the timeline show Notice received, Facts
   extracted, Policy checked, and Actions staged.
3. Point to `REVIEW REQUIRED`: the deterministic amount check fails because
   `$1,440 > $1,000`; the agent does not pretend it can approve the charge.
4. Show the four records: calendar hold staged, approval task staged, vendor reply
   drafted, and audit record written. Point out that the vendor draft is
   `sendable: false`.
5. Run `CLOUD_RUN_URL="https://YOUR_SERVICE_URL" npm run verify:runtime`, then show
   the Cloud Run service URL, revision, and runtime response in the authorized Google
   Cloud console. This step is still open in the current evidence target.
6. Close on the safety boundary: no auto-send, no auto-cancel, and human approval
   is required for financial commitment.

## Recording checklist

- Keep the synthetic notice and account names clearly labeled as demo data.
- Keep the browser address bar or console context visible when presenting cloud
  runtime proof; do not show API keys, Secret Manager values, or private logs.
- Capture the final commit SHA and Cloud Run revision in the video description.
- Do not describe the local memory fallback as Firestore persistence.
- Do not claim Gemini API execution unless a live Gemini request was actually
  recorded and its model identity can be verified.
