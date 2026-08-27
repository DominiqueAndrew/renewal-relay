# Renewal Relay release evidence receipt

Captured: 2026-08-27 (Europe/Paris)

Historical container evidence baseline: `2addfdc4e74320fcfa6c53ea934b5aaa044dbf0a`

Current public source/evidence commit: [`85ce2eca5f99fcc3a41c57fd9f78555b8dab3447`](https://github.com/DominiqueAndrew/renewal-relay/commit/85ce2eca5f99fcc3a41c57fd9f78555b8dab3447), verified by public CI run [33088618041](https://github.com/DominiqueAndrew/renewal-relay/actions/runs/33088618041). The UI implementation boundary is [`417a2b2ea8a6d435dbe736328d475f692f3b147f`](https://github.com/DominiqueAndrew/renewal-relay/commit/417a2b2ea8a6d435dbe736328d475f692f3b147f), verified by run [33087945307](https://github.com/DominiqueAndrew/renewal-relay/actions/runs/33087945307).

Public repository: [github.com/DominiqueAndrew/renewal-relay](https://github.com/DominiqueAndrew/renewal-relay)

## Current commit container verification

| Surface | Evidence | Result |
| --- | --- | --- |
| Container build | `docker build --no-cache -t renewal-relay:release-85ce2ec .` | Passed; lockfile-backed production install completed with 128 packages and npm reported 0 vulnerabilities |
| Image identity | `docker image inspect renewal-relay:release-85ce2ec` | `sha256:d7911f58d5f9026696d2d9f31211329620f201abfce6f0ccc5220a08a9f0e9dc` |
| Production dependency audit | `docker run --rm --entrypoint npm renewal-relay:release-85ce2ec audit --omit=dev` | 0 vulnerabilities |
| Runtime smoke | Fresh container `/api/health`, `/api/demo`, and `/api/runs` | Health 200; synthetic fallback labeled; queue 202; final `complete`; `REVIEW_REQUIRED`; 4 actions; all `record_only`; all retry-safe; vendor draft non-sendable; source fingerprint matches SHA-256 format |
| Runtime proof contract | `CLOUD_RUN_URL=http://127.0.0.1:18084 npm run verify:runtime` | `verified`; local `/api/health` 200; this is local-container proof, not a live Cloud Run claim |
| Served UI contract | `GET /` from the fresh container | HTTP 200; provenance, provider, and fingerprint markup present |

## Verified on the historical evidence baseline

| Surface | Evidence | Result |
| --- | --- | --- |
| Dependency installation | GitHub Actions run [33086143961](https://github.com/DominiqueAndrew/renewal-relay/actions/runs/33086143961), job 98566186067 | `npm ci --ignore-scripts`, `npm test`, `npm run check`, and `npm run check:secrets` passed |
| Automated behavior | Local `npm test` | 19 passed, 0 failed |
| Policy conformance | Local `npm run eval` | 8/8 exact matches; status accuracy 1.0; review recall 1.0; ready precision 1.0 |
| Container build | `docker build --no-cache -t renewal-relay:release-2add .` | Passed; lockfile-backed `npm ci` installed 128 production packages |
| Image identity | `docker image inspect renewal-relay:release-2add` | `sha256:0c075fa802ce8f2e1a1889fa1277f894a3d617c1b3630af03ce2064a75b56b5a` |
| Production dependency audit | `docker run --rm --entrypoint npm renewal-relay:release-2add audit --omit=dev` | 0 vulnerabilities |
| Runtime smoke | Fresh container `/api/health`, `/api/demo`, and `/api/runs` | Health 200; synthetic fallback labeled; queue 202; final `complete`; `REVIEW_REQUIRED`; 4 actions; all `record_only`; vendor draft non-sendable; source fingerprint present |
| Runtime proof contract | `CLOUD_RUN_URL=http://127.0.0.1:18083 npm run verify:runtime` | `verified`; local `/api/health` 200; no live Cloud Run URL was supplied |
| Tracked secret hygiene | `npm run check:secrets` | 0 findings across 38 tracked files |
| Responsive UI follow-up | [responsive UI review](ui-review.md) on current UI/evidence commit | Six required viewports passed for completed and failed run-panel states; no horizontal overflow; provenance is hidden on failure |

## Judge-facing claim boundary

The reproducible local/container slice is complete: a synthetic renewal notice is
extracted, checked by deterministic policy code, and turned into four reversible
internal records behind a human approval gate. The UI and smoke test prove those
states locally. The service is Cloud Run-ready, but this receipt does not claim a
live Cloud Run revision, Firestore persistence, or Gemini API request. The current
container proof is bound to the public `85ce2ec` commit and image digest above;
the historical baseline remains listed only for traceability.

## Open gates

- A human must provide an authorized Google Cloud project and credentials before a
  real Cloud Run deployment, Firestore verification, or Secret Manager proof can be
  performed.
- A human must record and publish the required demo video with visible Google Cloud
  runtime proof.
- A human must confirm eligibility, country, and Devpost agreements, then perform
  the final submission. No Devpost submission is claimed here.
