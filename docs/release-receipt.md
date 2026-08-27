# Renewal Relay release evidence receipt

Captured: 2026-08-27 (Europe/Paris)

Evidence target (implementation boundary): `ac26ee67d8fb1b54667ef90d9cfc5c1f0e578cfa`

Public repository: [github.com/DominiqueAndrew/renewal-relay](https://github.com/DominiqueAndrew/renewal-relay)

## Verified on the evidence target

| Surface | Evidence | Result |
| --- | --- | --- |
| Dependency installation | GitHub Actions run [33085012809](https://github.com/DominiqueAndrew/renewal-relay/actions/runs/33085012809), job 98562174894 | `npm ci --ignore-scripts`, `npm test`, `npm run check`, and `npm run check:secrets` passed |
| Automated behavior | Local `npm test` | 18 passed, 0 failed |
| Policy conformance | Local `npm run eval` | 8/8 exact matches; status accuracy 1.0; review recall 1.0; ready precision 1.0 |
| Container build | `docker build --no-cache -t renewal-relay:release-ac26 .` | Passed; lockfile-backed `npm ci` installed 128 production packages |
| Image identity | `docker image inspect renewal-relay:release-ac26` | `sha256:a82690577336a08f15c497a2ba2bdda6f3ba8fb9e00bb71ec5722cbed60ed105` |
| Production dependency audit | `docker run --rm --entrypoint npm renewal-relay:release-ac26 audit --omit=dev` | 0 vulnerabilities |
| Runtime smoke | Fresh container `/api/health`, `/api/demo`, and `/api/runs` | Health 200; synthetic fallback labeled; queue 202; final `complete`; `REVIEW_REQUIRED`; 4 actions; all `record_only`; vendor draft non-sendable; source fingerprint present |
| Runtime proof contract | `CLOUD_RUN_URL=http://127.0.0.1:18081 npm run verify:runtime` | `verified`; local `/api/health` 200; no live Cloud Run URL was supplied |
| Tracked secret hygiene | `npm run check:secrets` | 0 findings across 37 tracked files |
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
