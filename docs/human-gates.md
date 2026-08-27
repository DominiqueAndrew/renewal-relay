# Final human-gate handoff

Snapshot: 2026-08-27 (Europe/Paris)

Project: [github.com/DominiqueAndrew/renewal-relay](https://github.com/DominiqueAndrew/renewal-relay)

Submission deadline from the live Devpost form: `2026-09-01T00:00:00Z`.

This checklist contains actions that require the entrant’s account access,
personal facts, consent, or final judgment. The repository does not mark any item
complete on the entrant’s behalf.

## 1. Google Cloud and live Gemini proof

- [ ] Provide or select an authorized Google Cloud project with approved billing/
  credits, a deployment region, and permission to create Cloud Run/Firestore/
  Secret Manager resources.
- [ ] Store `GEMINI_API_KEY` in Secret Manager and grant only the Cloud Run service
  account access to that secret. Never paste the key into the repository, video,
  chat, shell history, or browser address bar.
- [ ] Deploy the committed project and record the Cloud Run service URL and
  revision. Create/verify the Firestore database and service-account permissions.
- [ ] Run `CLOUD_RUN_URL="https://YOUR_SERVICE_URL" npm run verify:runtime` from
  this repository. Save the redacted `verified` JSON as evidence.
- [ ] Perform at least one real Gemini-backed run and verify the model identity;
  the current local demo remains the explicitly labeled deterministic fallback.

## 2. Public demo video

- [ ] Record the source notice, Run Renewal Relay click, four timeline stages,
  `REVIEW REQUIRED` result, four staged records, `sendable:false` boundary, and
  the human approval requirement.
- [ ] Show the deployed Cloud Run URL, revision, and `/api/health` response in
  the authorized console/browser context. Do not show credentials or private logs.
- [ ] Keep synthetic ZenCloud data labeled as demo data and publish the video at a
  public URL suitable for the Devpost form.

## 3. Devpost entrant and submission actions

- [ ] Confirm entrant type, country of residence, solo/team status, eligibility,
  and required rules/privacy/terms agreements in the live Devpost form.
- [ ] Use category `Taskmaster`, project start date `08-27-26`, repository URL,
  reproducible README answer `Yes`, `Google GenAI SDK`, `Cloud Run`/`Firestore`,
  architecture diagram `docs/architecture.svg`, and Gemini model
  `gemini-3.5-flash` where the form asks for them.
- [ ] Add the public demo-video URL. A hosted project URL is optional in the live
  form; a zip upload is not required by the current form snapshot.
- [ ] Review the generated project description, links, permissions, and claims;
  submit only after the entrant gives final confirmation.

## Current truthful status

The public repository, reproducible tests, architecture diagram, evidence appendix,
runtime checker, and demo runbook are ready. Live Cloud Run/Firestore deployment,
live Gemini execution, public video publication, personal eligibility fields, and
final Devpost submission remain open. No Devpost submission is claimed.
