export function getRunPresentation(run = {}) {
  const status = run.status || "idle";
  const timelineLength = Array.isArray(run.timeline) ? run.timeline.length : 0;
  const active = status === "queued" || status === "running";
  const complete = status === "complete";
  const failed = status === "failed";
  const showEvidence = complete && typeof run.provider === "string" && run.provider.length > 0 && /^[a-f0-9]{64}$/i.test(String(run.sourceFingerprint || ""));

  return {
    heading: complete ? "Renewal packet ready" : failed ? "Run stopped safely" : active ? "Working through notice" : "Waiting for a notice",
    progressText: complete ? "Run complete · evidence recorded" : failed ? "Run stopped safely · no actions staged" : active ? "Agent is working in the background…" : "Ready when you are",
    buttonLabel: active ? "Agent is running…" : failed ? "Retry safely" : complete ? "Run again" : "Run Renewal Relay",
    progress: Math.min(100, Math.round((timelineLength / 4) * 100)),
    showDecision: complete && Boolean(run.decision),
    showActions: complete && Array.isArray(run.actions) && run.actions.length > 0,
    showEvidence
  };
}

export function redactFingerprint(value) {
  const fingerprint = String(value || "");
  return /^[a-f0-9]{64}$/i.test(fingerprint) ? fingerprint.slice(0, 12) + "…" + fingerprint.slice(-8) : "Unavailable";
}
