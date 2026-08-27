# Devpost submission answer pack

Snapshot: 2026-08-27, Europe/Paris. Live plugin refresh: 2026-08-27T15:43:22Z. This is a copy-paste draft for the live All Things Agentic Hackathon form, refreshed through the Devpost Hackathons plugin. Devpost remains authoritative if the form changes. Do not treat a placeholder as an answer and do not submit without the entrant's own confirmations.

## Project content

| Form area | Draft answer |
| --- | --- |
| Project title | `Renewal Relay` |
| Tagline | `Renewal Relay turns a renewal notice into a policy-checked, human-approved action packet before the deadline disappears.` |
| Category | `Taskmaster` |
| Description | Use the [submission description](submission.md#description). It describes the synthetic notice, Gemini extraction boundary, deterministic policy, four staged records, asynchronous run, and human approval boundary. |
| Built with | `Gemini 3.5 Flash` adapter, `Google GenAI SDK (google-genai)`, `Node.js`, `Cloud Run`, `Firestore`, vanilla HTML/CSS/JavaScript; live Gemini execution remains a gate |
| Code repository | `https://github.com/DominiqueAndrew/renewal-relay` |
| Architecture diagram | Upload `docs/architecture.png` from the exact public release commit. The editable source is `docs/architecture.svg`; the live field accepts PNG/JPG/JPEG/PDF/PPT/PPTX. |
| Demo video | Human must publish a public YouTube or Vimeo URL after recording the live Cloud Run proof. |

Live deliverable contract: a public demo video is required; a hosted website URL and zip file are not required by the current form.

## Required custom fields

The IDs are the live form identifiers observed on 2026-08-27; labels and options should be checked once more in the form immediately before submission.

| ID | Live label | Copy-paste answer or gate |
| ---: | --- | --- |
| 28083 | Submitter Type | `Individuals`, only after the entrant confirms the personal eligibility facts. |
| 28084 | Submitter country of residence | Human-only: select the entrant's actual country of residence; never infer it. |
| 28085 | Which Category are you submitting to? | `Taskmaster` |
| 28086 | If submitting on behalf of an Organization, what is the Organization name? | Leave blank for an individual entry if the form conditionally hides it; if the form requires it, the entrant must supply the truthful organization name. |
| 28087 | What date did you start this project? | `08-27-26`, supported by initial commit `6208e5384f736801bd4d376fc8c3fd255beb642e` at `2026-08-27T15:26:43+02:00`. |
| 28141 | URL to your public or private code repo | `https://github.com/DominiqueAndrew/renewal-relay` |
| 28089 | Did you add Reproducible Testing instructions to your README? | `Yes` |
| 28088 | Hosted project URL if available | Leave blank until a real Cloud Run URL exists; optional in the observed live form. |
| 28090 | Testing instructions optional | `Clone the repo, run npm ci, npm test, npm run check, npm run eval, and npm run check:secrets. See README.md.` |
| 28091 | Which Google SDK did you use? | The live field is multi-select. Select `Google GenAI SDK (google-genai)` only. |
| 28142 | Which Google Cloud Service (s) did you use? | The live field is multi-select with `Cloud Run`, `Cloud SQL`, `Firestore`, `Google Kubernetes (GKE)`, and `Pub/Sub`. Select every service actually used and evidenced; the intended final selection is `Cloud Run` + `Firestore` only after live deployment and Firestore read-back are verified. |
| 28092 | Architecture diagram | Upload `docs/architecture.png`; the live field rejects SVG and accepts PDF/PPT/PPTX/PNG/JPG/JPEG. |
| 28143 | Which Google AI Models did you use? Gemini 3.5 or newer is REQUIRED. | `Gemini 3.5 Flash (gemini-3.5-flash)` only after a live Gemini-backed run is verified. No additional model is claimed. |

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

## Live registration checkpoint

The live form reports `can_register: true`, `already_registered: false`, and team choices `Working solo`, `Looking for teammates`, and `Already have a team`. Required registration inputs are the entrant's Discord username (the form says `NA if not applicable`), truthful GEAR `Yes`/`No`, and two separate required agreement checkboxes: Google Cloud communications and personal-data processing under Google's Privacy Policy. The optional employment organization may be left blank. The form links the [official rules](https://allthingsagentichackathon.devpost.com/rules) and [Devpost terms](https://info.devpost.com/terms).

## Evidence boundary

The current public source/evidence commit is [`85ce2eca5f99fcc3a41c57fd9f78555b8dab3447`](https://github.com/DominiqueAndrew/renewal-relay/commit/85ce2eca5f99fcc3a41c57fd9f78555b8dab3447); its public GitHub Actions run [33088618041](https://github.com/DominiqueAndrew/renewal-relay/actions/runs/33088618041) passed. The UI implementation boundary is [`417a2b2ea8a6d435dbe736328d475f692f3b147f`](https://github.com/DominiqueAndrew/renewal-relay/commit/417a2b2ea8a6d435dbe736328d475f692f3b147f). Local conformance is 20/20 tests and 8/8 policy-evaluation cases, and the current container receipt records the `85ce2ec` image digest and smoke evidence. These facts do not substitute for live Cloud Run, live Gemini, a public video, personal eligibility, or Devpost submission proof; see the [release-readiness review](release-readiness.md) and [human-gate handoff](human-gates.md).
