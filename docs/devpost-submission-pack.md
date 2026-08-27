# Devpost submission answer pack

Snapshot: 2026-08-27, Europe/Paris. This is a copy-paste draft for the live All Things Agentic Hackathon form, refreshed through the Devpost Hackathons plugin. Devpost remains authoritative if the form changes. Do not treat a placeholder as an answer and do not submit without the entrant's own confirmations.

## Project content

| Form area | Draft answer |
| --- | --- |
| Project title | `Renewal Relay` |
| Tagline | `Renewal Relay turns a renewal notice into a policy-checked, human-approved action packet before the deadline disappears.` |
| Category | `Taskmaster` |
| Description | Use the [submission description](submission.md#description). It describes the synthetic notice, Gemini extraction boundary, deterministic policy, four staged records, asynchronous run, and human approval boundary. |
| Built with | `Gemini 3.5 Flash`, `Google GenAI SDK (google-genai)`, `Node.js`, `Cloud Run`, `Firestore`, vanilla HTML/CSS/JavaScript |
| Code repository | `https://github.com/DominiqueAndrew/renewal-relay` |
| Architecture diagram | Upload `docs/architecture.svg` from the exact public release commit. |
| Demo video | Human must publish a public YouTube or Vimeo URL after recording the live Cloud Run proof. |

## Required custom fields

The IDs are the live form identifiers observed on 2026-08-27; labels and options should be checked once more in the form immediately before submission.

| ID | Live label | Copy-paste answer or gate |
| ---: | --- | --- |
| 28083 | Submitter Type | `Individuals`, only after the entrant confirms the personal eligibility facts. |
| 28084 | Submitter country of residence | Human-only: select the entrant's actual country of residence; never infer it. |
| 28085 | Which Category are you submitting to? | `Taskmaster` |
| 28086 | Organization name | Leave blank for an individual entry if the form conditionally hides it; if the form requires it, the entrant must supply the truthful organization name. |
| 28087 | What date did you start this project? | `08-27-26`, supported by initial commit `6208e5384f736801bd4d376fc8c3fd255beb642e` at `2026-08-27T15:26:43+02:00`. |
| 28141 | URL to your public or private code repo | `https://github.com/DominiqueAndrew/renewal-relay` |
| 28089 | Did you add Reproducible Testing instructions to your README? | `Yes` |
| 28088 | Hosted project URL if available | Leave blank until a real Cloud Run URL exists; optional in the observed live form. |
| 28090 | Testing instructions optional | `Clone the repo, run npm ci, npm test, npm run check, npm run eval, and npm run check:secrets. See README.md.` |
| 28091 | Which Google SDK did you use? | `Google GenAI SDK (google-genai)` |
| 28142 | Which Google Cloud Service(s) did you use? | The live snapshot reports a dropdown with `Cloud Run`, `Cloud SQL`, `Firestore`, `Google Kubernetes (GKE)`, and `Pub/Sub`, without a multiple-select flag. Select the actually verified service in the live form; `Cloud Run` is the intended primary answer, and mention Firestore in the project description if separately verified. |
| 28092 | Architecture diagram | `docs/architecture.svg` upload |
| 28143 | Which Google AI Models did you use? | `Gemini 3.5 Flash (gemini-3.5-flash)` only after a live Gemini-backed run is verified; until then this remains an implemented-path claim, not runtime proof. |

Leave the Startup Prize organization/email fields and optional bonus blog/social fields blank unless the entrant supplies truthful values and explicitly opts in.

## Judge-facing proof map

| Criterion | The two-sentence case | Evidence to show |
| --- | --- | --- |
| Innovation & Operational Utility — 40% | Renewal Relay turns one notice into a decision plus four next-step records. The operator does not translate a summary into calendar, approval, reply, and audit work. | Timeline and four action cards; explain that all records are internal and reversible. |
| Architectural Discipline & Tech Stack — 30% | Gemini extracts bounded facts; deterministic code owns the policy decision; the agent, store, server, and UI are separate. Failed extraction produces no actions, and replay identity is stable. | Architecture diagram, source modules, failed-run state, tests, idempotency keys, and source fingerprint. |
| Demo & Production Readiness — 30% | The run is asynchronous, observable, reproducible, and safe by default. | Public video must show the live Cloud Run service URL/revision, `/api/health`, one run, and the human approval boundary. |

## Entrant-owned final gates

- Confirm age-of-majority eligibility and actual country of residence against the [official rules](https://allthingsagentichackathon.devpost.com/rules), including excluded territories.
- Read and explicitly accept the live rules, terms, privacy/marketing choices, and any registration form agreements. Registration has not been performed.
- Provide an authorized Google Cloud project/credentials, deploy Cloud Run with the intended Firestore configuration, and capture service URL, revision, and `/api/health` proof without exposing secrets.
- Run the live Gemini path and verify the model identity. Keep the deterministic adapter labeled as local fallback.
- Record and publish the required public video; then enter its URL and any verified hosted URL.
- Review every field in the live form and perform the final submission. No submission is claimed by this repository.

## Evidence boundary

The implementation/evidence boundary is [`2addfdc4e74320fcfa6c53ea934b5aaa044dbf0a`](https://github.com/DominiqueAndrew/renewal-relay/commit/2addfdc4e74320fcfa6c53ea934b5aaa044dbf0a); later commits are documentation-only. GitHub Actions run [33086143961](https://github.com/DominiqueAndrew/renewal-relay/actions/runs/33086143961) passed on that SHA. Local conformance is 19/19 tests and 8/8 policy-evaluation cases. These facts do not substitute for live Cloud Run, live Gemini, a public video, personal eligibility, or Devpost submission proof; see the [release-readiness review](release-readiness.md) and [human-gate handoff](human-gates.md).
