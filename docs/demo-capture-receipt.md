# Demo capture receipt

Fill this receipt only from observed evidence during the final authorized demo pass. A blank field is an open gate, not a successful check. Never paste API keys, secret values, private logs, or personal eligibility data into this file.

## Capture identity

| Field | Observed value |
| --- | --- |
| Captured at (UTC) | `[YYYY-MM-DDThh:mm:ssZ]` |
| Repository | `https://github.com/DominiqueAndrew/renewal-relay` |
| Implementation/evidence SHA | `[full 40-character commit SHA]` |
| Video URL (YouTube/Vimeo) | `[public URL after publication]` |

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
