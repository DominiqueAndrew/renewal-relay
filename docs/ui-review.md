# Responsive UI review

Review target: current worktree provenance-row change (completed-run evidence plus failed-state clearing) and the local runtime-label claim boundary.
Review date: 2026-08-27
Method: the responsive-ui-review checklist, Playwright CLI with Chrome at 100% zoom, synthetic local demo data. Screenshots were captured at the required viewport sizes after scrolling the run panel into view; each PNG retains the requested viewport dimensions.

## Evidence matrix

| Viewport | Completed-state artifact | Failed-state artifact | Observed result | Verdict |
| --- | --- | --- | --- | --- |
| 390 × 844 | [complete-mobile-run-390x844.png](../output/playwright/complete-mobile-run-390x844.png) | [failed-mobile-run-390x844.png](../output/playwright/failed-mobile-run-390x844.png) | Provenance stacks cleanly; failed state shows retry only | Pass |
| 768 × 1024 | [complete-tablet-run-768x1024.png](../output/playwright/complete-tablet-run-768x1024.png) | [failed-tablet-run-768x1024.png](../output/playwright/failed-tablet-run-768x1024.png) | Two-column evidence stays aligned; failed state has no evidence | Pass |
| 1366 × 768 | [complete-laptop-run-1366x768.png](../output/playwright/complete-laptop-run-1366x768.png) | [failed-laptop-run-1366x768.png](../output/playwright/failed-laptop-run-1366x768.png) | Provider and redacted digest remain compact beside policy result | Pass |
| 1440 × 900 | [complete-desktop-run-1440x900.png](../output/playwright/complete-desktop-run-1440x900.png) | [failed-desktop-run-1440x900.png](../output/playwright/failed-desktop-run-1440x900.png) | Run panel and source panel retain balanced desktop geometry | Pass |
| 1920 × 1080 | [complete-large-run-1920x1080.png](../output/playwright/complete-large-run-1920x1080.png) | [failed-large-run-1920x1080.png](../output/playwright/failed-large-run-1920x1080.png) | No clipping or horizontal overflow; action section remains below | Pass |
| 2560 × 1440 | [complete-wide-run-2560x1440.png](../output/playwright/complete-wide-run-2560x1440.png) | [failed-wide-run-2560x1440.png](../output/playwright/failed-wide-run-2560x1440.png) | Wide layout stays centered; safe failure state remains sparse | Pass |

## State assertions

The completed run shows PROVENANCE / RECORDED, the provider label, and a shortened SHA-256 digest (12 hex chars ... 8 hex chars) before the policy result. The failed run shows Run stopped safely, Run stopped safely · no actions staged, and an enabled Retry safely button; the provenance, decision, and action regions are all hidden and cleared.

The completed-state screenshots also show four staged action records. The initial shell and CTA geometry is unchanged by this completed-state-only addition; the initial state remains covered by the prior baseline review at the six required viewport sizes.

## Claim-boundary follow-up

The top-right runtime label now reads `Cloud Run-ready local` for the memory
fallback and changes to `Cloud Run · Firestore` only when Firestore is configured.
The six fresh completed-state captures below were inspected at 100% zoom and
device scale factor 1; the label remains compact, does not clip, and introduces
no horizontal overflow. On narrow mobile it is intentionally reduced by the
existing topbar rule.

| Viewport | Fresh completed-state artifact | Verdict |
| --- | --- | --- |
| 390 × 844 | [claim-complete-mobile-390x844.png](../output/playwright/claim-complete-mobile-390x844.png) | Pass |
| 768 × 1024 | [claim-complete-tablet-768x1024.png](../output/playwright/claim-complete-tablet-768x1024.png) | Pass |
| 1366 × 768 | [claim-complete-laptop-1366x768.png](../output/playwright/claim-complete-laptop-1366x768.png) | Pass |
| 1440 × 900 | [claim-complete-desktop-1440x900.png](../output/playwright/claim-complete-desktop-1440x900.png) | Pass |
| 1920 × 1080 | [claim-complete-large-1920x1080.png](../output/playwright/claim-complete-large-1920x1080.png) | Pass |
| 2560 × 1440 | [claim-complete-wide-2560x1440.png](../output/playwright/claim-complete-wide-2560x1440.png) | Pass |

## Scope and residual risk

No responsive blocker was found in the current visual pass. This is local Chrome evidence only; cross-browser behavior and a deployed Google Cloud runtime remain separate release gates.
