import { getRunPresentation } from "./run-state.js";

const $ = (id) => document.getElementById(id);
const icons = { calendar: "□", task: "✓", draft: "✎", audit: "⌁" };
let notice;

async function loadDemo() {
  const response = await fetch("/api/demo");
  const data = await response.json();
  notice = data.notice;
  $("noticeVendor").textContent = "ZenCloud";
  $("noticeSubject").textContent = notice.subject;
  $("noticeFrom").textContent = notice.from;
  $("noticeBody").textContent = notice.body;
  $("runtimeLabel").textContent = data.cloud.store === "Firestore configured" ? "Cloud Run · Firestore" : "Cloud Run ready";
}

function renderTimeline(run) {
  const timeline = $("timeline");
  const presentation = getRunPresentation(run);
  if (run.timeline?.length) timeline.innerHTML = run.timeline.map((event) => "<div class='timeline-item'><span class='timeline-icon " + (event.state === "running" ? "active" : event.state === "failed" ? "failed" : "") + "'>" + (event.state === "failed" ? "!" : event.state === "running" ? "·" : "✓") + "</span><div class='timeline-copy'><strong>" + escapeHtml(event.label) + "</strong><span>" + escapeHtml(event.detail) + "</span></div><span class='timeline-time'>" + formatTime(event.at) + "</span></div>").join("");
  $("progressBar").style.width = presentation.progress + "%";
  $("progressText").textContent = presentation.progressText;
  $("runHeading").textContent = presentation.heading;
  $("runId").textContent = run.id;
}

function renderDecision(run) {
  if (!getRunPresentation(run).showDecision) {
    $("decisionCard").classList.add("hidden");
    return;
  }
  $("decisionCard").classList.remove("hidden");
  $("decisionStatus").textContent = run.decision.status.replaceAll("_", " ");
  $("decisionTitle").textContent = run.decision.status === "REVIEW_REQUIRED" ? "Human approval required" : "Ready for approval";
  $("decisionRationale").textContent = run.decision.rationale;
  $("checkCount").textContent = run.decision.passedChecks + "/" + run.decision.totalChecks;
  $("checks").innerHTML = run.decision.checks.map((check) => "<div class='check " + (check.passed ? "passed" : "") + "'><span class='check-mark'>" + (check.passed ? "✓" : "!") + "</span><span>" + escapeHtml(check.label) + "</span><span class='check-detail'>" + escapeHtml(check.detail) + "</span></div>").join("");
}

function renderActions(run) {
  if (!getRunPresentation(run).showActions) {
    $("actionsSection").classList.add("hidden");
    $("actionGrid").innerHTML = "";
    return;
  }
  $("actionsSection").classList.remove("hidden");
  $("actionGrid").innerHTML = run.actions.map((item) => "<article class='action-card'><span class='action-symbol'>" + (icons[item.type] || "·") + "</span><h3>" + escapeHtml(item.title) + "</h3><p>" + escapeHtml(item.detail) + "</p><span class='action-status'>" + escapeHtml(item.status) + "</span></article>").join("");
}

function renderRun(run) {
  renderTimeline(run);
  renderDecision(run);
  renderActions(run);
  $("runButton").querySelector("span:first-child").textContent = getRunPresentation(run).buttonLabel;
}

async function runAgent() {
  const button = $("runButton");
  button.disabled = true;
  renderRun({ id: "QUEUED", status: "queued", timeline: [] });
  $("timeline").innerHTML = "<div class='empty-state'><span class='empty-icon'>◌</span><p>Starting the background run…</p></div>";
  try {
    const response = await fetch("/api/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(notice) });
    if (!response.ok) throw new Error("The background run could not be started.");
    const { runId } = await response.json();
    if (!runId) throw new Error("The background run did not return an ID.");
    let done = false;
    for (let attempt = 0; !done && attempt < 60; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 180));
      const runResponse = await fetch("/api/runs/" + runId);
      if (!runResponse.ok) throw new Error("The background run could not be read back.");
      const run = await runResponse.json();
      renderRun(run);
      done = ["complete", "failed"].includes(run.status);
    }
    if (!done) throw new Error("The background run timed out before a terminal state.");
  } catch (error) {
    renderRun({
      id: "LOCAL FAILURE",
      status: "failed",
      timeline: [{ id: "local_failure", state: "failed", label: "Run stopped safely", detail: error.message || "The run could not be completed." }]
    });
  } finally {
    button.disabled = false;
  }
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[character]));
}

$("runButton").addEventListener("click", runAgent);
loadDemo().catch((error) => { $("progressText").textContent = "Unable to load demo: " + error.message; });
