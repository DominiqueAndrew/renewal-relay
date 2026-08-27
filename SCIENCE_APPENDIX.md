# Renewal Relay — science, engineering, and submission evidence

This appendix keeps material claims testable and separates observed evidence from
design assumptions. It is intentionally more technical than the main README.

Snapshot date: 2026-08-27 (Europe/Paris). The Devpost Hackathons plugin returned
the event as `submissions_open` at 2026-08-27T13:49:30Z. The project is a synthetic,
reproducible vertical slice; it has not been connected to a real mailbox, calendar,
task system, vendor, Gemini API key, or Google Cloud project in this worktree.

## 1. Source register

### Official event sources

- [All Things Agentic Hackathon overview](https://allthingsagentichackathon.devpost.com/) — event purpose, tracks, resources, and submission framing. Retrieved through the Devpost Hackathons plugin (`get_hackathon_overview`).
- [Official rules](https://allthingsagentichackathon.devpost.com/rules) — eligibility, new-project requirement, required technologies, testing, ownership, and binding contest terms. Retrieved through `get_hackathon_rules`; the Devpost page remains authoritative.
- [Official resources](https://allthingsagentichackathon.devpost.com/resources) — Cloud credits, Google agent tooling, Cloud Run/Firestore links, workshops, and cost guidance.
- [Official FAQ](https://allthingsagentichackathon.devpost.com/details/faqs) — organizer-maintained clarifications.

The live plugin endpoints also supplied the judging criteria, prize tiers, key dates,
registration form, announcements, and submission fields. The relevant snapshot was:

- deadline: `2026-09-01T00:00:00Z` (August 31, 2026 at 5:00 PM PT);
- judging: `2026-09-01T16:00:00Z` through `2026-09-25T00:00:00Z`;
- winners announced: `2026-10-08T19:00:00Z`;
- prize pool: `$180,000`; Grand Prize `$50,000`; Taskmaster, Collaborative Partner,
  Fortified Enterprise Fleet, and Startup Excellence `$20,000` each; Individual/Hobbyist
  `$10,000` with two winners; Best Architectural Design and Best Multimodal UX `$5,000`
  with two winners each;
- registration: solo entry is available (`Working solo`); the form requires explicit
  rules and eligibility agreement plus Discord, GEAR, and privacy/marketing fields;
- submission: a demo video is required; a hosted URL and zip are not required by the
  live form, while category, country, project start date, repository, README testing
  answer, Google SDK, Google Cloud service, architecture diagram, and Gemini model are
  required fields.

The plugin's dates endpoint and rules text converge on the deadline above. Where any
other event field differs across a cached resource, the live Devpost page wins.

### Engineering sources

- [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/structured-output) — official JSON-schema-shaped output support and its limits. This supports using the model for bounded extraction, not for policy authorization.
- [Gemini tools and function calling](https://ai.google.dev/gemini-api/docs/tools) — official distinction between structured output and tool/function execution. Renewal Relay currently uses structured extraction and local action records, not unapproved external function calls.
- [Cloud Run container runtime contract](https://docs.cloud.google.com/run/docs/container-contract) — the ingress process must listen on `0.0.0.0` and the provided port.
- [Cloud Run Node.js deployment quickstart](https://docs.cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service) — official source for the source deployment path and `PORT` behavior.
- [Firestore data model](https://docs.cloud.google.com/firestore/native/docs/data-model) — official document/collection model used by the optional run store.
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) and its [Playbook](https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook) — governance, mapping, measurement, and management framing for documenting risks and human-AI responsibilities. This is guidance, not a certification of this prototype.

The runtime dependencies are pinned directly to `@google/genai` 2.19.0 and
`@google-cloud/firestore` 9.0.0. In the rebuilt image, `npm audit --omit=dev`
returned 0 vulnerabilities. There is intentionally no generated lockfile in this
small worktree yet, so transitive resolution can still change between installs; the
passing CI/image checks are evidence for this commit, not a promise of immutable
dependency supply-chain state.

## 2. Claim-to-evidence map

| Material claim | Evidence in this repository | Boundary / interpretation |
| --- | --- | --- |
| The system runs as an asynchronous background workflow. | `POST /api/runs` returns `202` and a run ID; `src/server.js` starts `agent.run` without awaiting it; `test/server.test.js` polls until completion. | Demonstrated locally and in the Docker image; Cloud Run deployment is prepared but not live-verified. |
| Gemini is limited to fact extraction with a constrained JSON shape. | `src/ai/gemini-adapter.js` uses `@google/genai`, `responseMimeType: application/json`, and `EXTRACTION_SCHEMA`; the prompt forbids invention and records missing facts. | API execution was not performed here because no key was available. The deterministic adapter is explicitly labeled synthetic fallback. |
| Policy decisions are inspectable and independent of model prose. | `src/domain/policy.js` contains pure amount, time, cancellation-window, and owner checks; `test/agent.test.js` fixes the clock for the threshold test. | Thresholds are product-policy assumptions, not learned or empirically optimal values. |
| The agent fails closed on extraction failure. | `createRenewalAgent` catches adapter errors, emits a failed timeline event, and returns no action packet; the test asserts no `actions`. | Persistence callback failures are operational errors and should be monitored in a production deployment. |
| The workflow produces meaningful internal side effects. | The run store records a source notice, timeline, decision, four action records, and guardrails; the UI renders them separately. | “Calendar hold” and “approval task” are staged records in this prototype, not mutations to a real external calendar/task service. The vendor draft is always `sendable: false`. |
| Cloud Run and Firestore are supported by the architecture. | `Dockerfile` listens through `PORT`; `src/server.js` binds `0.0.0.0`; `src/store/run-store.js` selects Firestore when `GOOGLE_CLOUD_PROJECT` is set and otherwise uses memory; Docker smoke test passed. | No live Google Cloud project, service account, or Firestore read/write was available for this run. |
| The project is reproducible. | `README.md`, `package.json`, Dockerfile, seven automated tests, and GitHub Actions workflow are committed; CI passed on the pushed SHA. | The live Gemini path and live Cloud Run path still require credentials. |

## 3. Decision model

Let:

- `A` = extracted renewal amount;
- `T` = policy amount threshold, here `$1,000`;
- `D` = whole days until the renewal date;
- `W` = review window, here `7` days;
- `C` = `1` if an explicit cancellation deadline was extracted, otherwise `0`;
- `O` = `1` if an owner email was extracted, otherwise `0`.

The implementation computes:

```text
D = ceil((renewalDateAtNoonUTC - nowAtNoonUTC) / 86,400,000)

amount_pass   = (A <= T)
deadline_pass = (D >= W)
cancel_pass   = (C = 1)
owner_pass    = (O = 1)

status = READY_FOR_APPROVAL if every check passes
         REVIEW_REQUIRED    otherwise

risk = high if (A > T) or (D < W), otherwise guarded
```

The synthetic notice gives `A = 1,440`, `D = 16` on 2026-08-27,
`C = 1`, and `O = 1`. Therefore 3 of 4 checks pass, the amount check fails,
and the deterministic result is `REVIEW_REQUIRED` with `high` risk.

This is a conservative gate, not an estimate of financial loss. The design assumes
the cost of a false “ready” decision (`C_false_ready`) is materially greater than
the cost of a false review (`C_false_review`):

```text
C_false_ready >> C_false_review
```

Under that stated assumption, routing any failed check to a person is rational. The
prototype does not estimate either cost and therefore does not claim an optimized
threshold or calibrated business-risk score.

The extraction `confidence` field is a review signal only. It is not treated as a
probability because this project has no labeled corpus or calibration experiment.
Missing fields are explicit and cause review rather than imputation.

## 4. Safety and architecture invariants

1. The source notice is read-only; no source message is forwarded or edited.
2. The model extracts facts; deterministic code owns the financial and deadline decision.
3. A failed extraction produces a failed run and no actions.
4. All current actions are reversible internal records. No external message is sent,
   no contract is cancelled, and no financial commitment is approved automatically.
5. The vendor draft is marked `sendable: false` in the action metadata.
6. Local execution uses synthetic ZenCloud data and a memory store. A configured
   deployment can use Firestore, but credentials are not committed.
7. Production deployment should bind `GEMINI_API_KEY` through Secret Manager and use
   least-privilege service-account permissions; the README records this as a
   deployment requirement, not as completed evidence.

These invariants map to the NIST framing of documenting roles, risks, measurement, and
management across the AI lifecycle. They are implementation choices, not a claim that
the prototype is production-certified.

## 5. Evaluation design and observed results

### Automated tests

The test set contains eight cases:

1. synthetic extraction preserves vendor, amount, dates, and missing-fact behavior;
2. amount threshold escalates a high-value renewal;
3. a complete run emits four action records and guardrails;
4. an unavailable extraction provider fails closed with no actions;
5. health endpoint responds with the Cloud Run-ready service identity;
6. HTTP run creation is queued asynchronously and reaches completion;
7. incomplete HTTP notices are rejected before queueing;
8. the fixed-clock policy matrix conforms at the amount boundary and across missing/urgent facts.

Observed result: **8 passed, 0 failed** via `npm test`; syntax, whitespace, and
container checks also passed. The separate `npm run eval` report is **8/8 exact
policy-conformance cases**, with exact-match rate `1.0`, status accuracy `1.0`,
review recall `1.0` across six expected-review cases, and ready precision `1.0`
across two expected-ready cases. These are conformance metrics against hand-authored
policy labels, not estimates of model accuracy or business outcomes.

### Container and UI checks

- `docker build -t renewal-relay:local .` passed.
- The image imported both `@google/genai` and `@google-cloud/firestore`.
- A container smoke run returned HTTP 200 from `/api/health`; a POST returned `202`
  and a run transitioned from `queued` through `running` to `complete` with four
  actions and `REVIEW_REQUIRED`.
- The UI was inspected at 390×844, 768×1024, 1366×768, 1440×900, 1920×1080, and
  2560×1440. The CTA remained visible and no horizontal overflow was observed; the
  completed action state rendered the four cards and decision summary.

### Missing experiments

- No live Gemini request was made, so extraction precision/recall, latency, token
  cost, and calibration are unknown.
- No real renewal corpus was used, so no generalization or fairness claim is made.
- No live Cloud Run or Firestore deployment was completed, so cloud IAM, cold start,
  persistence, retry, and multi-instance behavior remain unverified.
- No external action adapter exists yet; production integrations need idempotency keys,
  authorization scopes, retry policy, and provider-specific contract tests before they
  can replace staged records.

## 6. Devpost rubric and form mapping

The live judging criteria returned by the plugin are Innovation & Operational Utility
40%, Architectural Discipline & Tech Stack 30%, and Demo & Production Readiness 30%.

| Official criterion | Renewal Relay proof | Remaining gap |
| --- | --- | --- |
| Innovation & Operational Utility — 40% | A renewal notice becomes a policy result plus four explicit next-step records without hand-holding. | Add a real, consented integration only if credentials and time permit; keep human approval. |
| Architectural Discipline & Tech Stack — 30% | Extraction, policy, agent, server, store, and UI are separate modules; structured output, injected clock, failure path, Docker, and Firestore adapter are documented. | Live cloud IAM and retry/idempotency evidence are not yet available. |
| Demo & Production Readiness — 30% | Timeline UI, static architecture diagram, README, tests, Docker smoke, and CI provide a reproducible story. | Required public video with visible Google Cloud runtime proof and hosted URL remain open. |

### Draft field answers (truthful as of this snapshot)

- Category: `Taskmaster`.
- Submitter type: `Individuals` only if the entrant confirms their eligibility in the
  Devpost form; do not infer this from the code repository.
- Country of residence: human-only field; not guessed here.
- Project start date: `08-27-26`, supported by the initial commit timestamp of
  `6208e5384f736801bd4d376fc8c3fd255beb642e` (`2026-08-27T15:26:43+02:00`).
- Repository: [github.com/DominiqueAndrew/renewal-relay](https://github.com/DominiqueAndrew/renewal-relay), main at `d79ffff12c4bceb274d05bd222f9568bafbc2804`.
- Reproducible README: `Yes`.
- Google SDK: `Google GenAI SDK (google-genai)`.
- Google Cloud services: `Cloud Run` and `Firestore` as the configured deployment path.
- Gemini model: `Gemini 3.5 Flash` (`gemini-3.5-flash`) in the live adapter; deterministic
  extractor is the explicit no-key local fallback.
- Architecture diagram: `docs/architecture.svg`.
- Hosted URL: not available yet.
- Demo video: required by the live form; not recorded yet.
- Organization/startup and bonus fields: leave blank unless the entrant supplies the
  required personal or organizational facts and URLs.

## 7. Reproduction

From the repository root:

```bash
npm install
npm test
npm run check
docker build -t renewal-relay:local .
docker run --rm -p 8080:8080 renewal-relay:local
```

Open `http://localhost:8080`, click **Run Renewal Relay**, and verify the timeline,
policy result, four staged records, and guardrails. For cloud proof, follow the
README deployment instructions only with an authorized Google Cloud project and keep
API keys in Secret Manager. Capture the Cloud Run service URL/revision and `/api/health`
response for the public demo; do not claim that proof until it exists.
