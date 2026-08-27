# Responsive UI review

Review targets: `7b1bb3ae3e78fa61aed26fa805ceb2083a77a8e` for initial/completed geometry; `2b5488196830b301bb6aa556d3c651bae52e8f08` for the failure/retry state
Review date: 2026-08-27  
Method: responsive-ui-review checklist, Chrome headless at 100% zoom, local synthetic demo data.

## Evidence matrix

| Viewport | Initial CTA geometry | Initial width | Completed state | Verdict |
| --- | ---: | ---: | --- | --- |
| 390 × 844 | y=640–701; visible | 390 | 4 action cards; no overflow | Pass |
| 768 × 1024 | y=559–620; visible | 768 | 4 action cards; no overflow | Pass |
| 1366 × 768 | y=600–661; visible | 1366 | 4 action cards; no overflow | Pass |
| 1440 × 900 | y=608–669; visible | 1440 | 4 action cards; no overflow | Pass |
| 1920 × 1080 | y=608–669; visible | 1920 | 4 action cards; no overflow | Pass |
| 2560 × 1440 | y=608–669; visible | 2560 | 4 action cards; no overflow | Pass |

The completed run showed `Renewal packet ready`, `REVIEW REQUIRED`, the four-step timeline, and `Actions staged`. The action cards remain in the scrollable document on narrow and wide layouts; they are confirmed by DOM count and are not clipped. The initial primary CTA is above the fold at every required viewport.

## Captured artifacts

The inspected local screenshot artifacts are retained outside Git at `/tmp`:

- `/tmp/renewal-relay-mobile-initial-current.png`
- `/tmp/renewal-relay-tablet-initial-current.png`
- `/tmp/renewal-relay-laptop-initial-current.png`
- `/tmp/renewal-relay-desktop-initial-current.png`
- `/tmp/renewal-relay-large-initial-current.png`
- `/tmp/renewal-relay-wide-initial-current.png`
- `/tmp/renewal-relay-mobile-completed-current.png`
- `/tmp/renewal-relay-tablet-completed-current.png`
- `/tmp/renewal-relay-laptop-completed-current.png`
- `/tmp/renewal-relay-desktop-completed-current.png`
- `/tmp/renewal-relay-large-completed-current.png`
- `/tmp/renewal-relay-wide-completed-current.png`

## Scope and residual risk

No responsive blocker was found: document width matched the viewport at all six sizes, the CTA was visible in the initial state, and the completed state rendered four staged action records. This is local Chrome evidence only; cross-browser behavior and a deployed Google Cloud runtime remain separate release gates.

## Failure and retry spot check

At 390 × 844, a browser-controlled provider failure produced `Run stopped safely`,
`Run stopped safely · no actions staged`, and an enabled `Retry safely` button. The
decision card and action section remained hidden (`actionCards=0`), and document/body
width stayed 390px. The scrolled visual artifact is retained outside Git at
`/tmp/renewal-relay-mobile-failure-ui-failed-scrolled.png`.
