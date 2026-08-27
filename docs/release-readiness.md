# Renewal Relay release-readiness review

Snapshot: 2026-08-27, Europe/Paris

Implementation/evidence boundary: [`417a2b2ea8a6d435dbe736328d475f692f3b147f`](https://github.com/DominiqueAndrew/renewal-relay/commit/417a2b2ea8a6d435dbe736328d475f692f3b147f)
Review decision: **repository ready with notes; overall submission blocked on human/platform gates**

This is a release review, not a claim of deployment or submission. The implementation/evidence boundary is the last public commit reviewed with CI; no version tag exists. The first repository commit is `2026-08-27T15:26:43+02:00`, inside the live submission period.

## Live event contract

Refreshed through the Devpost Hackathons plugin on 2026-08-27. Devpost remains authoritative.

| Requirement | Observed live value | Repository evidence |
| --- | --- | --- |
| Status and deadline | Submissions open; ends `2026-09-01T00:00:00Z` | [official event](https://allthingsagentichackathon.devpost.com/), [rules](https://allthingsagentichackathon.devpost.com/rules) |
| Eligibility/team | Above legal age; listed countries/territories excluded; all occupations; company not required; solo allowed | [official rules](https://allthingsagentichackathon.devpost.com/rules) |
| Judging | Innovation & Operational Utility 40%; Architectural Discipline & Tech Stack 30%; Demo & Production Readiness 30% | [SCIENCE_APPENDIX.md](../SCIENCE_APPENDIX.md#6-devpost-rubric-and-form-mapping) |
| Category | `Taskmaster` is a required form option | [docs/submission.md](submission.md) |
| Required deliverables | Public demo video required; website and zip not required | [docs/submission.md](submission.md) |
| Required form evidence | Repo, reproducible README answer, Google SDK, Google Cloud service, architecture diagram, Gemini 3.5+ model | [docs/human-gates.md](human-gates.md) |

## Verified at the release boundary

- The public repository contains the current reviewed boundary: `git ls-remote renewal refs/heads/main` returned `b61ea9a38f6514313443d6c5007595bc840fa74d`.
- GitHub Actions run [33090844696](https://github.com/DominiqueAndrew/renewal-relay/actions/runs/33090844696), job `98582940534`, passed on the exact public SHA. It runs `npm ci`, tests, static checks, and the tracked-secret scan.
- `npm test`: 20 passed, 0 failed.
- `npm run check`: passed, including server, AI adapter, agent, public state, browser bundle, runtime checker, and secret checker syntax/behavior checks.
- `npm run eval`: 8/8 policy-conformance cases; status accuracy `1.0`; review recall `1.0`; ready precision `1.0`.
- `npm run check:secrets`: 0 findings across 54 tracked files; no secret value was emitted.
- The current release receipt at [`docs/release-receipt.md`](release-receipt.md) records a successful Docker smoke run for `b61ea9a` (`202` to `complete`), image digest `sha256:d2a24783db29808040863b2d7e95161c116769cafe64743d5fe5cdbfbf248691`, `npm audit --omit=dev` with 0 vulnerabilities, local `/api/health` verification, source-fingerprint matching, four staged actions, and `REVIEW_REQUIRED`. The older `2addfdc` container remains listed only as historical traceability.
- The responsive UI review covers mobile, tablet, laptop, desktop, large-desktop, and wide-desktop geometry, including the failed-run state: [`docs/ui-review.md`](ui-review.md).

## Open blockers

These are intentionally not represented as completed release claims:

1. No authorized Google Cloud project or credentials are available in this worktree. Cloud Run deployment, Firestore persistence, IAM, Secret Manager, revision identity, and live cloud `/api/health` proof are unverified.
2. No Gemini API key is available. The live Gemini request/model path is implemented and validated structurally, but no real Gemini-backed extraction run is claimed. Local demos use the explicitly labeled deterministic synthetic adapter.
3. The required public demo video has not been recorded or published. It must show the live Cloud Run runtime proof and the human approval boundary.
4. The entrant must personally confirm eligibility, country, project facts, rules/terms agreements, and the final Devpost submission. No registration or submission is claimed.

The complete action list is [docs/human-gates.md](human-gates.md). It is the remaining handoff, not an instruction to invent missing evidence.

## Non-blocking notes and residual risk

- The current evidence is strong for a local, reproducible vertical slice, but it is not production-provider evidence until the authorized Cloud Run, Firestore, and Gemini checks are performed.
- GitHub Actions reports a non-blocking Node.js 20 deprecation warning from an action dependency. It does not fail the release boundary, but should be refreshed before a long-lived production workflow.
- No external calendar, task system, mailbox, or contract was mutated. The action cards are reversible internal records and financial commitment remains human-approved by design.

## Final release posture

The code/repository boundary is ready for the human deployment-and-submission pass. The overall project is **not submission-ready yet** because three externally observable artifacts are still missing: live Google Cloud/Gemini proof, the public demo video, and the entrant's final Devpost confirmations. Until those gates are completed and re-verified, do not describe Renewal Relay as deployed, Gemini-executed, registered, or submitted.
