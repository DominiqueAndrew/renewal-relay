import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const port = 8099;
let processHandle;
const repoRoot = fileURLToPath(new URL("..", import.meta.url));

test.before(async () => {
  processHandle = spawn(process.execPath, ["src/server.js"], { cwd: repoRoot, env: { ...process.env, PORT: String(port), AGENT_STEP_DELAY_MS: "0", FIRESTORE_ENABLED: "false" }, stdio: "ignore" });
  await new Promise((resolve) => setTimeout(resolve, 450));
});

test.after(() => processHandle?.kill());

test("health endpoint exposes a Cloud Run-ready service", async () => {
  const response = await fetch("http://localhost:" + port + "/api/health");
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.match(body.service, /renewal-relay/);
});

test("run endpoint queues a background run and returns the completed packet", async () => {
  const demo = await (await fetch("http://localhost:" + port + "/api/demo")).json();
  const queuedResponse = await fetch("http://localhost:" + port + "/api/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(demo.notice) });
  const queued = await queuedResponse.json();
  assert.equal(queuedResponse.status, 202);
  let run;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    run = await (await fetch("http://localhost:" + port + "/api/runs/" + queued.runId)).json();
    if (run.status === "complete") break;
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
  assert.equal(run.status, "complete");
  assert.equal(run.actions.length, 4);
});

test("run endpoint rejects incomplete notices before queueing", async () => {
  const response = await fetch("http://localhost:" + port + "/api/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: "Too short", body: "Missing" }) });
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.error, "Provide a subject and notice body.");
});
