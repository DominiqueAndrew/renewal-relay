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
  if (!run.timeline?.length) return;
  timeline.innerHTML = run.timeline.map((event) => "<div class='timeline-item'><span class='timeline-icon " + (event.state === "running" ? "active" : "") + "'>" + (event.state === "failed" ? "!" : event.state === "running" ? "·" : "✓") + "</span><div class='timeline-copy'><strong>" + escapeHtml(event.label) + "</strong><span>" + escapeHtml(event.detail) + "</span></div><span class='timeline-time'>" + formatTime(event.at) + "</span></div>").join("");
  const progress = Math.min(100, Math.round((run.timeline.length / 4) * 100));
  $("progressBar").style.width = progress + "%";
  $("progressText").textContent = run.status === "complete" ? "Run complete · evidence recorded" : run.status === "failed" ? "Run stopped safely" : "Agent is working in the background…";
  $("runHeading").textContent = run.status === "complete" ? "Renewal packet ready" : "Working through notice";
  $("runId").textContent = run.id;
}

function renderDecision(run) {
  if (!run.decision) return;
  $("decisionCard").classList.remove("hidden");
  $("decisionStatus").textContent = run.decision.status.replaceAll("_", " ");
  $("decisionTitle").textContent = run.decision.status === "REVIEW_REQUIRED" ? "Human approval required" : "Ready for approval";
  $("decisionRationale").textContent = run.decision.rationale;
  $("checkCount").textContent = run.decision.passedChecks + "/" + run.decision.totalChecks;
  $("checks").innerHTML = run.decision.checks.map((check) => "<div class='check " + (check.passed ? "passed" : "") + "'><span class='check-mark'>" + (check.passed ? "✓" : "!") + "</span><span>" + escapeHtml(check.label) + "</span><span class='check-detail'>" + escapeHtml(check.detail) + "</span></div>").join("");
}

function renderActions(run) {
  if (!run.actions?.length) return;
  $("actionsSection").classList.remove("hidden");
  $("actionGrid").innerHTML = run.actions.map((item) => "<article class='action-card'><span class='action-symbol'>" + (icons[item.type] || "·") + "</span><h3>" + escapeHtml(item.title) + "</h3><p>" + escapeHtml(item.detail) + "</p><span class='action-status'>" + escapeHtml(item.status) + "</span></article>").join("");
}

async function runAgent() {
  const button = $("runButton");
  button.disabled = true;
  button.querySelector("span:first-child").textContent = "Agent is running…";
  $("decisionCard").classList.add("hidden");
  $("actionsSection").classList.add("hidden");
  $("timeline").innerHTML = "<div class='empty-state'><span class='empty-icon'>◌</span><p>Starting the background run…</p></div>";
  const response = await fetch("/api/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(notice) });
  const { runId } = await response.json();
  let done = false;
  while (!done) {
    await new Promise((resolve) => setTimeout(resolve, 180));
    const run = await (await fetch("/api/runs/" + runId)).json();
    renderTimeline(run);
    renderDecision(run);
    renderActions(run);
    done = ["complete", "failed"].includes(run.status);
  }
  button.disabled = false;
  button.querySelector("span:first-child").textContent = "Run again";
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[character]));
}

$("runButton").addEventListener("click", runAgent);
loadDemo().catch((error) => { $("progressText").textContent = "Unable to load demo: " + error.message; });
