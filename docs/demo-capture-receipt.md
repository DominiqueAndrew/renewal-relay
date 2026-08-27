# Demo capture receipt

Fill this receipt only from observed evidence during the final authorized demo pass. A blank field is an open gate, not a successful check. Never paste API keys, secret values, private logs, or personal eligibility data into this file.

## Capture identity

| Field | Observed value |
| --- | --- |
| Captured at (UTC) | `[YYYY-MM-DDThh:mm:ssZ]` |
| Repository | `https://github.com/DominiqueAndrew/renewal-relay` |
| Implementation/evidence SHA | `[full 40-character commit SHA]` |
| Video URL (YouTube/Vimeo) | `[public URL after publication]` |

## Current credential-free rehearsal (not live proof)

This section records the latest reproducible local fallback. It must not be copied
into the live Cloud Run or Gemini fields below.

| Field | Observed value |
| --- | --- |
| Captured at (UTC) | `2026-08-27T15:49:38.909Z` |
| Source SHA | `41195fd0a3ee01813fd66a7921dcb5cfb4f08a2c` |
| Public CI | [run 33089814678](https://github.com/DominiqueAndrew/renewal-relay/actions/runs/33089814678), green on the source SHA |
| Image build | `docker build --no-cache -t renewal-relay:release-41195fd .` passed |
| Docker image | `renewal-relay:release-41195fd` |
| Image digest | `sha256:89ccf1f44cbaf751dccd0165d17d7c787b9765d9046652b58f8489e7d3a2646c` |
| Local endpoint | `http://127.0.0.1:18085` during capture; container stopped afterward |
| Health and demo | HTTP 200; service `renewal-relay`; deterministic synthetic provider and memory fallback explicitly labeled |
| Queue/read-back | POST `202`; local run `run_mtbp7ryj` reached `complete` |
| Policy/action result | `REVIEW_REQUIRED`; 3/4 policy checks passed; 4 actions; all `record_only` and retry-safe; vendor draft `sendable: false` |
| Source integrity | Source fingerprint matched the expected 64-hex SHA-256 format |
| Local runtime checker | `verified` at `2026-08-27T15:49:39.366Z`; local proof only, not Cloud Run evidence |
| Production dependency audit | `npm audit --omit=dev`: 0 vulnerabilities |

Reproduce this fallback with `docker run --rm -p 8080:8080 renewal-relay:release-41195fd`
or the local commands in [human-action-pack.md](human-action-pack.md). The live
Cloud Run, Firestore, Gemini, video, and Devpost fields remain open until observed.

## Runtime evidence

| Field | Observed value |
| --- | --- |
| Google Cloud project | `[project ID; no credentials]` |
| Region | `[region]` |
| Cloud Run service | `[service name]` |
| Cloud Run revision | `[revision name]` |
| Cloud Run URL | `[HTTPS service URL]` |
| `/api/health` result | `[HTTP status, service name, provider label; redacted JSON path]` |
| Runtime checker result | `[verified / failed / blocked]` from `CLOUD_RUN_URL="[URL]" npm run verify:runtime` |
| Firestore read/write proof | `[observed run ID/read-back evidence, or open]` |

The runtime checker must report `verified` against the deployed HTTPS URL. A local `127.0.0.1` result is useful rehearsal evidence but does not satisfy this section.

## Live model evidence

| Field | Observed value |
| --- | --- |
| Requested model | `[configured model name]` |
| Provider label returned by service | `[observed provider label]` |
| Live Gemini run ID | `[run ID]` |
| Extraction response validation | `[valid / failed; record only redacted result]` |
| Timestamp | `[UTC timestamp]` |

Do not mark this section complete from the source code or deterministic fallback. The model identity must be observed in a real Gemini-backed run.

## Video proof checklist

- [ ] Synthetic ZenCloud notice is visibly labeled as demo data.
- [ ] The run shows intake, extraction, policy, and action stages.
- [ ] `$1,440 > $1,000` is shown as the deterministic reason for `REVIEW_REQUIRED`.
- [ ] Four staged records are visible: calendar hold, approval task, non-sendable vendor draft, and audit record.
- [ ] `sendable: false`, no auto-send, no auto-cancel, and human approval are stated.
- [ ] Cloud Run URL, revision, and `/api/health` proof are visible without secrets or private logs.
- [ ] The exact implementation SHA in this receipt is included in the video description.

## Devpost status

| Field | Observed value |
| --- | --- |
| Entrant eligibility/country | `[confirmed by entrant in live form]` |
| Registration | `[not performed / registered; record live confirmation only]` |
| Required agreements | `[confirmed by entrant / open]` |
| Submission category | `Taskmaster` |
| Demo video entered | `[yes after URL publication / open]` |
| Submission status/ID/URL | `[human-confirmed live result; leave blank until submitted]` |

## Final evidence decision

- [ ] All runtime and model fields above are observed, not inferred.
- [ ] Video is public and matches the captured SHA and runtime revision.
- [ ] The entrant reviewed eligibility, agreements, form answers, and project claims.
- [ ] Final Devpost submission was explicitly confirmed by the entrant.

Until every applicable field is filled from live evidence, retain the status **not submission-ready** and do not claim deployment, Gemini execution, registration, or submission.
