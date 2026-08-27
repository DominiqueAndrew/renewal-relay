# Renewal Relay human action pack

This is the smallest path from the verified local slice to a truthful live demo and Devpost submission. Every step requires the entrant's own account access or consent. Never paste credentials into chat, commit them, or mark a gate complete from source code alone.

## Live Devpost checkpoint

The Devpost Hackathons plugin refreshed the official event surfaces at `2026-08-27T15:43:22Z`: the event is `submissions_open`, the deadline is `2026-09-01T00:00:00Z` (August 31 at 5:00 PM Pacific), and the current form still reports `can_register: true` and `already_registered: false`. The latest credit announcement says delivery is delayed and asks entrants not to submit duplicate requests while waiting; credits are not guaranteed, so use the credential-free fallback below if access is not approved.

Verified runtime/image source boundary: commit
`85ce2eca5f99fcc3a41c57fd9f78555b8dab3447`, with green CI run
[33088618041](https://github.com/DominiqueAndrew/renewal-relay/actions/runs/33088618041).
The matching local image receipt is recorded in [release-receipt.md](release-receipt.md);
its digest is `sha256:d7911f58d5f9026696d2d9f31211329620f201abfce6f0ccc5220a08a9f0e9dc`.
Immediately before any deployment or recording, run `git rev-parse HEAD` and retain
that exact returned SHA alongside the Cloud Run revision; the intervening public
commits are documentation-only.

If requesting the advertised credits, open the live [Resources tab](https://allthingsagentichackathon.devpost.com/resources) and use the link shown there. The current rules text and Resources block expose different Google Forms URLs, so do not hard-code either one or claim that credits were requested/approved without the entrant's own receipt.

## Inputs the human must provide

| Input | Why it is needed | Safe evidence to retain |
| --- | --- | --- |
| Authorized Google Cloud project ID, billing/credits approval, and region | Cloud Run, Firestore, Secret Manager, and API enablement | Project ID and region only |
| Authorized Google account and deployer permissions | Login, service-account attachment, and deployment | Redacted identity and command result |
| Gemini API key from Google AI Studio | A real Gemini-backed extraction run | Model/provider output only; never the key |
| Public video account | Devpost's required public demo video | Final YouTube/Vimeo URL |
| Entrant age-of-majority status, country, Discord, GEAR answer, and agreements | Registration and eligibility | Live-form confirmation only |
| Final Devpost confirmation | Consequential submission action | Submission status, ID, and URL shown by Devpost |

## Credential-free fallback available now

Use this path when no authorized Cloud/Gemini access is available. It is valid rehearsal and repository evidence, not live provider proof.

```bash
npm ci
npm test
npm run eval
npm run check
npm run check:secrets
npm start
```

Open `http://localhost:8080`, run the synthetic ZenCloud notice, and record the local result in [demo-capture-receipt.md](demo-capture-receipt.md). Expected: `202 -> complete`, `REVIEW_REQUIRED`, four internal `record_only` actions, a non-sendable vendor draft, and a source fingerprint. Do not enter a fake Cloud Run URL, model proof, or video URL in Devpost.

## Google Cloud path

Replace placeholders only in the human's authorized shell. These commands contain no secret values.

### 1. Authenticate and select the project

```bash
gcloud auth login
gcloud auth list --filter=status:ACTIVE
gcloud config set project PROJECT_ID
gcloud projects describe PROJECT_ID --format='value(projectId,lifecycleState)'
```

Expected: the intended account is active, the project ID is correct, and the project is usable. If billing or credits are not approved, stop and use the fallback.

### 2. Enable APIs and create or verify Firestore

```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com firestore.googleapis.com secretmanager.googleapis.com
gcloud firestore databases describe --database='(default)'
```

If the default database does not exist, create it once:

```bash
gcloud firestore databases create --database='(default)' --location='REGION' --type=firestore-native
```

Expected: APIs are enabled and the `(default)` database is in the selected region. See Google's [Firestore database management](https://cloud.google.com/firestore/docs/manage-databases).

### 3. Create the Gemini secret without exposing it

In [Google AI Studio API keys](https://aistudio.google.com/app/apikey), choose **Create API key**, and keep the key in approved secret management. In Google Cloud Console use **Secret Manager -> Create secret -> Name: `gemini-api-key` -> enter/upload the value -> Create secret**. Confirm that version `1` exists without opening or recording its value.

The CLI alternative uses a protected local file, never a command-line value:

```bash
gcloud secrets create gemini-api-key --replication-policy=automatic --data-file='/ABSOLUTE/PATH/TO/PROTECTED_KEY_FILE'
gcloud secrets versions add gemini-api-key --data-file='/ABSOLUTE/PATH/TO/PROTECTED_KEY_FILE'
```

Run the second command only when the secret already exists. Expected: Secret Manager shows the secret name and version number only. See Google's [Secret Manager quickstart](https://docs.cloud.google.com/secret-manager/docs/create-secret-quickstart) and [add-version guidance](https://docs.cloud.google.com/secret-manager/docs/add-secret-version).

### 4. Use a dedicated Cloud Run identity

```bash
gcloud iam service-accounts create renewal-relay-run --display-name='Renewal Relay Cloud Run'
gcloud secrets add-iam-policy-binding gemini-api-key --member='serviceAccount:renewal-relay-run@PROJECT_ID.iam.gserviceaccount.com' --role='roles/secretmanager.secretAccessor'
gcloud projects add-iam-policy-binding PROJECT_ID --member='serviceAccount:renewal-relay-run@PROJECT_ID.iam.gserviceaccount.com' --role='roles/datastore.user'
gcloud iam service-accounts add-iam-policy-binding renewal-relay-run@PROJECT_ID.iam.gserviceaccount.com --member='user:DEPLOYER_EMAIL' --role='roles/iam.serviceAccountUser'
```

Expected: the service identity can access the named secret and Firestore, and the deployer can attach it. See Google's [Cloud Run service identity](https://docs.cloud.google.com/run/docs/configuring/services/service-identity).

### 5. Deploy the committed source

From this repository, after recording `git rev-parse HEAD`:

```bash
gcloud run deploy renewal-relay --source . --region REGION --allow-unauthenticated --service-account renewal-relay-run@PROJECT_ID.iam.gserviceaccount.com --set-env-vars=GEMINI_MODEL=gemini-3.5-flash,FIRESTORE_ENABLED=true --update-secrets=GEMINI_API_KEY=gemini-api-key:1
```

`--allow-unauthenticated` is only for this public synthetic demo. Do not send real renewal notices or personal data. The secret is pinned to version `1`; use a different observed version if applicable. See [Cloud Run secrets](https://docs.cloud.google.com/run/docs/configuring/services/secrets).

Expected evidence:

```bash
gcloud run services describe renewal-relay --region=REGION --format='yaml(metadata.name,status.url,status.latestReadyRevisionName,status.conditions)'
```

Retain the service URL, latest ready revision, and a successful ready condition. Never retain secret values or private logs.

### 6. Verify runtime and run the synthetic notice

```bash
CLOUD_RUN_URL='https://SERVICE_URL' npm run verify:runtime
```

Expected redacted output: `status: verified`, HTTP 200, and `service: renewal-relay`. Open the deployed URL, keep the synthetic label visible, and run the notice. Expected live behavior: `202 -> complete`, Gemini provider label, `REVIEW_REQUIRED` for `$1,440 > $1,000`, four staged records, `sendable: false`, and human approval required.

For Firestore proof, use **Google Cloud Console -> Firestore -> Data -> `renewal-relay-runs`**, locate the captured run ID, and confirm the run/audit record was read back. Record only the run ID and sanitized status in [demo-capture-receipt.md](demo-capture-receipt.md).

## Public video path

Record one short, unedited walkthrough:

1. Show the public repository and exact implementation SHA.
2. Show the synthetic ZenCloud notice and its `$1,440` amount/cancellation deadline.
3. Click **Run Renewal Relay** and let the asynchronous timeline complete.
4. Show the deterministic `REVIEW_REQUIRED` reason and all four staged records.
5. Show the non-sendable vendor draft, source fingerprint, and human approval boundary.
6. Show the Cloud Run console service URL and latest revision, then the deployed `/api/health` response.
7. State that no external message was sent and no contract was cancelled.

Publish publicly on YouTube or Vimeo, verify the URL in a private browser window, and copy it into the receipt and Devpost form. Never show API keys, Secret Manager values, private logs, or personal eligibility data.

## Devpost registration and submission path

On the event page, select **Register**, then complete only with the entrant's own facts:

- Team preference: **Working solo**, **Looking for teammates**, or **Already have a team**; choose only the entrant's actual intent.
- Required Discord username: enter the entrant's value, or the form's stated `NA if not applicable`.
- **Have you signed up for GEAR?**: truthful **Yes** or **No**.
- Read the [official rules](https://allthingsagentichackathon.devpost.com/rules), [Devpost terms](https://info.devpost.com/terms), and eligibility text. Only the entrant may check the two required **I agree** boxes: one authorizes Google Cloud communications and the other acknowledges Google's Privacy Policy.
- Leave optional employment information blank unless the entrant chooses to provide it.

After registration, open the project submission form and use [devpost-submission-pack.md](devpost-submission-pack.md) for the project text and field map. Enter the actual country, public video URL, live hosted URL if available, verified Google service/model evidence, and upload `docs/architecture.png` (the live architecture field accepts PNG/JPG/JPEG/PDF/PPT/PPTX; `docs/architecture.svg` is the editable source, not the upload target). Select `Taskmaster`; the Google SDK and Cloud service fields are currently multi-select. Review every claim, then submit only after the entrant's explicit final confirmation. Record the returned status/ID/URL in the receipt.

## Evidence decision rule

| Evidence state | Allowed claim |
| --- | --- |
| Local fallback only | Reproducible synthetic demo; no live provider or cloud claim |
| Cloud Run health verified, but no live Gemini run | Deployed runtime health only; Gemini execution remains open |
| Cloud Run, Firestore read-back, and live Gemini run observed | State those exact observed facts with URL/revision/run ID; keep external side effects bounded |
| Public video published and entrant confirms fields/agreements; Devpost returns confirmation | Submission may be described as submitted using that returned confirmation |

Until the last row is actually observed, keep the project status **not submission-ready**. The [demo capture receipt](demo-capture-receipt.md) is the authoritative handoff record.
