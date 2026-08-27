# Renewal Relay

Renewal Relay is a narrow autonomous operations agent for a recurring, expensive chore: turning renewal notices into accountable next steps before a deadline disappears.

It reads one renewal notice, extracts the facts with Gemini 3.5 Flash, checks a deterministic company policy, then stages a calendar hold, routes an approval task, drafts a safe vendor reply, and writes an audit record. The agent runs asynchronously so the operator sees the work happen step by step. It never auto-sends a message or auto-cancels a contract.

## Why this is a complete workflow

The output is not a summary. It is a supervised action packet:

- source notice captured read-only
- source fingerprint recorded for audit and replay verification
- amount, renewal date, cancellation window, owner, and confidence extracted
- financial threshold and deadline checks evaluated by code, not by the model
- calendar review hold and approval task staged as explicit records
- vendor reply drafted but explicitly non-sendable
- staged records carry stable per-run idempotency keys for safe replay
- full run and guardrails persisted to Firestore when Cloud Run is configured with a project; local runs use an in-memory store

The demo uses synthetic ZenCloud data. With no API key, it uses a deterministic local extractor so the workflow remains reproducible. With GEMINI_API_KEY, the Google GenAI SDK uses the configured Gemini model and structured JSON output.

## Stack and contest fit

- Gemini 3.5 Flash through @google/genai (Google GenAI SDK)
- Node.js service designed for Google Cloud Run
- Firestore persistence when deployed with GOOGLE_CLOUD_PROJECT
- vanilla HTML/CSS/JS product UI with no build step
- Taskmaster category: a complete workflow, not a chat loop

The All Things Agentic Hackathon rules are authoritative. They require Gemini 3.5 or newer, a Google agent framework, and at least one Google Cloud infrastructure service. They also require a repository, reproducible setup instructions, architecture diagram, and a public demo video showing Google Cloud runtime proof. The deadline in the rules is August 31, 2026 at 5:00 PM PT / September 1, 2026 at 00:00 UTC. See the [official rules](https://allthingsagentichackathon.devpost.com/rules).

## Run locally

Requirements: Node.js 20+.

~~~bash
npm ci
npm test
npm run eval
npm run check
npm start
~~~

Open http://localhost:8080, then click **Run Renewal Relay**. The demo is synthetic and safe to run repeatedly.

`npm run eval` runs the fixed-clock eight-case policy conformance matrix and prints its JSON metrics.

### Optional live Gemini extraction

~~~bash
export GEMINI_API_KEY="your-key"
export GEMINI_MODEL="gemini-3.5-flash"
npm start
~~~

Never commit .env or keys. If Gemini is unavailable at runtime, the service fails closed for that extraction step and preserves the source notice; local demos use the explicit deterministic adapter only when no key is configured.

## Deploy to Google Cloud Run

The included Dockerfile is self-contained and uses the committed lockfile for reproducible dependency installation. With the Google Cloud CLI authenticated and a project selected:

~~~bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com firestore.googleapis.com
gcloud run deploy renewal-relay --source . --region europe-west1 --allow-unauthenticated --set-env-vars GEMINI_MODEL=gemini-3.5-flash,FIRESTORE_ENABLED=true
~~~

Set GEMINI_API_KEY through Secret Manager in a real deployment; do not pass it in shell history or commit it. Create a Firestore database in the selected project and grant the Cloud Run service account permission to read/write the renewal-relay-runs collection.

Cloud Run injects PORT; the service listens on 0.0.0.0 and exposes /api/health for the runtime proof step. The Cloud Run deployment URL, revision, and /api/health response should be captured for the submission video.

## Architecture

See [docs/architecture.md](docs/architecture.md), the [static architecture diagram](docs/architecture.svg), the [science and evidence appendix](SCIENCE_APPENDIX.md), the [responsive UI review](docs/ui-review.md), the [release evidence receipt](docs/release-receipt.md), the [demo runbook](docs/demo-runbook.md), and the [self-directed release backlog](BACKLOG.md). The key boundary is deliberate: Gemini extracts; deterministic code decides; action adapters stage reversible work; a human approves financial commitment.

## Demo script (under 4 minutes)

1. Show the source notice with the hidden renewal deadline and $1,440 amount.
2. Click **Run Renewal Relay** and let the four agent stages complete.
3. Point to the policy result: amount is above the $1,000 threshold, so the agent escalates instead of pretending it can approve.
4. Show the calendar hold, approval task, non-sendable vendor draft, and immutable audit record.
5. Open /api/health and the Cloud Run dashboard to prove the backend is running on Google Cloud.
6. Close on the guardrails: no auto-send, no auto-cancel, human approval required.
