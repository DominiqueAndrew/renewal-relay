import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { request as httpRequest } from "node:http";
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
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.match(response.headers.get("content-security-policy"), /default-src 'self'/);
  const pageResponse = await fetch("http://localhost:" + port + "/");
  assert.equal(pageResponse.headers.get("x-content-type-options"), "nosniff");
});

test("run endpoint queues a background run and returns the completed packet", async () => {
  const demo = await (await fetch("http://localhost:" + port + "/api/demo")).json();
  assert.equal(demo.cloud.runtime, "Cloud Run-compatible service");
  const queuedResponse = await fetch("http://localhost:" + port + "/api/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(demo.notice) });
  const queued = await queuedResponse.json();
  assert.equal(queuedResponse.status, 202);
  assert.match(queued.runId, /^run_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
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

test("run endpoint rejects oversized request bodies before buffering them", async () => {
  const response = await fetch("http://localhost:" + port + "/api/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: "Large notice", body: "x".repeat(100000) }) });
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.error, "Notice is too large");
});

test("run endpoint caps chunked request bodies without a content length", async () => {
  const result = await new Promise((resolve, reject) => {
    const request = httpRequest({ hostname: "localhost", port, path: "/api/runs", method: "POST", headers: { "Content-Type": "application/json" } }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ status: response.statusCode, body: JSON.parse(body) }));
    });
    request.on("error", reject);
    request.write(JSON.stringify({ subject: "Large notice", body: "x".repeat(70000) }));
    request.end("x".repeat(40000));
  });
  assert.equal(result.status, 400);
  assert.equal(result.body.error, "Notice is too large");
});

test("run endpoint does not pass malformed IDs to the run store", async () => {
  const response = await fetch("http://localhost:" + port + "/api/runs/run_bad/child");
  const body = await response.json();
  assert.equal(response.status, 404);
  assert.equal(body.error, "Run not found");
  assert.equal((await fetch("http://localhost:" + port + "/api/health")).status, 200);
});
