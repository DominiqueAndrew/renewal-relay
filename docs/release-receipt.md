# Renewal Relay release evidence receipt

Captured: 2026-08-27 (Europe/Paris)

Evidence target (implementation boundary): `2addfdc4e74320fcfa6c53ea934b5aaa044dbf0a`

Public repository: [github.com/DominiqueAndrew/renewal-relay](https://github.com/DominiqueAndrew/renewal-relay)

## Verified on the evidence target

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
| Responsive UI | [responsive UI review](ui-review.md) | Six required viewports passed; CTA visible; no horizontal overflow; 4 completed action cards |

## Judge-facing claim boundary

The reproducible local/container slice is complete: a synthetic renewal notice is
extracted, checked by deterministic policy code, and turned into four reversible
internal records behind a human approval gate. The UI and smoke test prove those
states locally. The service is Cloud Run-ready, but this receipt does not claim a
live Cloud Run revision, Firestore persistence, or Gemini API request. Documentation
commits after the evidence target do not change the implementation boundary.

## Open gates

- A human must provide an authorized Google Cloud project and credentials before a
  real Cloud Run deployment, Firestore verification, or Secret Manager proof can be
  performed.
- A human must record and publish the required demo video with visible Google Cloud
  runtime proof.
- A human must confirm eligibility, country, and Devpost agreements, then perform
  the final submission. No Devpost submission is claimed here.
