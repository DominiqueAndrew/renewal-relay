# Renewal Relay architecture

~~~mermaid
flowchart LR
  U[Operator] -->|pastes or receives notice| UI[Minimal web UI]
  UI -->|POST /api/runs| CR[Cloud Run service]
  CR --> Q[Background run state machine]
  Q --> G[Gemini 3.5 Flash / Google GenAI SDK]
  Q --> P[Pure policy engine / amount / deadline / owner]
  Q --> T[Action tools / calendar hold / task / draft / audit]
  T --> F[(Firestore / run + audit record)]
  CR -->|live polling| UI
  Q --> H[Human approval gate / no auto-send / no auto-cancel]
~~~

The Gemini call is limited to extraction of facts from the source notice. Decisions are made by the deterministic policy engine, and actions are reversible records until the human approval gate is satisfied. Firestore is optional locally and used when the Cloud Run service has a Google Cloud service account and GOOGLE_CLOUD_PROJECT configured.
