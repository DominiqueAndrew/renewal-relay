import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRenewalAgent, SAMPLE_NOTICE } from "./agent/renewal-agent.js";
import { createDemoAdapter, createGeminiAdapter } from "./ai/gemini-adapter.js";
import { createRunStore } from "./store/run-store.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLIC = join(ROOT, "public");
const PORT = Number(process.env.PORT || 8080);
const MAX_REQUEST_BODY_BYTES = 100000;
const RUN_ID_PATTERN = /^run_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const store = await createRunStore();
const adapter = createGeminiAdapter() || createDemoAdapter();
const agent = createRenewalAgent({ adapter });
const MIME_TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" };
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data:; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'"
};

function sendJson(res, status, body) {
  res.writeHead(status, { ...SECURITY_HEADERS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

async function bodyJson(req) {
  const declaredLength = Number(req.headers["content-length"]);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BODY_BYTES) throw new Error("Notice is too large");
  let body = "";
  let bodyBytes = 0;
  for await (const chunk of req) {
    bodyBytes += Buffer.byteLength(chunk);
    if (bodyBytes > MAX_REQUEST_BODY_BYTES) throw new Error("Notice is too large");
    body += chunk;
  }
  return JSON.parse(body || "{}");
}

function validNotice(notice) {
  return notice && typeof notice.subject === "string" && typeof notice.body === "string" && notice.subject.length >= 4 && notice.body.length >= 12;
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/demo") return sendJson(res, 200, { notice: SAMPLE_NOTICE, provider: adapter.provider, cloud: { runtime: "Cloud Run-compatible service", store: process.env.GOOGLE_CLOUD_PROJECT ? "Firestore configured" : "Memory fallback (local demo)" } });
  if (req.method === "GET" && pathname === "/api/health") return sendJson(res, 200, { ok: true, service: "renewal-relay", provider: adapter.provider, timestamp: new Date().toISOString() });
  if (req.method === "GET" && pathname.startsWith("/api/runs/")) {
    const runId = pathname.slice("/api/runs/".length);
    if (!RUN_ID_PATTERN.test(runId)) return sendJson(res, 404, { error: "Run not found" });
    const run = await store.get(runId);
    return run ? sendJson(res, 200, run) : sendJson(res, 404, { error: "Run not found" });
  }
  if (req.method === "POST" && pathname === "/api/runs") {
    try {
      const notice = await bodyJson(req);
      if (!validNotice(notice)) return sendJson(res, 400, { error: "Provide a subject and notice body." });
      const runId = "run_" + randomUUID();
      const update = async (run) => store.put(run);
      await store.put({ id: runId, status: "queued", createdAt: new Date().toISOString(), notice, provider: adapter.provider, timeline: [] });
      void agent.run({ ...notice, id: notice.id || "notice_" + Date.now().toString(36) }, { runId, onProgress: update });
      return sendJson(res, 202, { runId, status: "queued" });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || "Invalid JSON" });
    }
  }
  return false;
}

async function serveStatic(res, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const filePath = normalize(join(PUBLIC, requested));
  if (filePath !== PUBLIC && !filePath.startsWith(PUBLIC + sep)) return sendJson(res, 403, { error: "Forbidden" });
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { ...SECURITY_HEADERS, "Content-Type": MIME_TYPES[extname(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch {
    sendJson(res, 404, { error: "Not found" });
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  if (url.pathname.startsWith("/api/")) {
    const handled = await handleApi(req, res, url.pathname);
    if (handled !== false) return;
  }
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });
  await serveStatic(res, url.pathname);
});

server.listen(PORT, "0.0.0.0", () => console.log("Renewal Relay listening on http://localhost:" + PORT + " · " + adapter.provider));
