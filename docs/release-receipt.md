# Renewal Relay release evidence receipt

Captured: 2026-08-27 (Europe/Paris)

Evidence target: `1024a0b2ed40b550fe0782e9c3762a1dc43f5e05`

Public repository: [github.com/DominiqueAndrew/renewal-relay](https://github.com/DominiqueAndrew/renewal-relay)

## Verified on the evidence target

| Surface | Evidence | Result |
| --- | --- | --- |
| Dependency installation | GitHub Actions run [33081373414](https://github.com/DominiqueAndrew/renewal-relay/actions/runs/33081373414), job 98549192091 | `npm ci --ignore-scripts`, `npm test`, and `npm run check` passed |
| Automated behavior | Local `npm test` | 17 passed, 0 failed |
| Policy conformance | Local `npm run eval` | 8/8 exact matches; status accuracy 1.0; review recall 1.0; ready precision 1.0 |
| Container build | `docker build --no-cache -t renewal-relay:release-1024 .` | Passed; lockfile-backed `npm ci` installed 128 production packages |
| Production dependency audit | `docker run --rm --entrypoint npm renewal-relay:release-1024 audit --omit=dev` | 0 vulnerabilities |
| Runtime smoke | Container `/api/health` and `/api/runs` | Health 200; queue 202; final `complete`; `REVIEW_REQUIRED`; 4 actions; `sendable:false` |
| Runtime proof contract | `CLOUD_RUN_URL=http://127.0.0.1:8080 npm run verify:runtime` | Verified local `/api/health`; no live Cloud Run URL was supplied |
| Responsive UI | [responsive UI review](ui-review.md) | Six required viewports passed; CTA visible; no horizontal overflow; 4 completed action cards |

## Judge-facing claim boundary

The reproducible local/container slice is complete: a synthetic renewal notice is
extracted, checked by deterministic policy code, and turned into four reversible
internal records behind a human approval gate. The UI and smoke test prove those
states locally. The service is Cloud Run-ready, but this receipt does not claim a
live Cloud Run revision, Firestore persistence, or Gemini API request.

## Open gates

- A human must provide an authorized Google Cloud project and credentials before a
  real Cloud Run deployment, Firestore verification, or Secret Manager proof can be
  performed.
- A human must record and publish the required demo video with visible Google Cloud
  runtime proof.
- A human must confirm eligibility, country, and Devpost agreements, then perform
  the final submission. No Devpost submission is claimed here.
