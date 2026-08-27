import { fileURLToPath } from "node:url";

export async function verifyRuntime(baseUrl, fetchImpl = fetch) {
  if (!baseUrl) return { ok: false, status: "blocked", reason: "CLOUD_RUN_URL is required" };

  let parsed;
  try {
    parsed = new URL(baseUrl);
  } catch {
    return { ok: false, status: "failed", reason: "CLOUD_RUN_URL is not a valid URL" };
  }
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) {
    return { ok: false, status: "failed", reason: "CLOUD_RUN_URL must be an HTTP(S) URL without credentials" };
  }

  const healthUrl = new URL("/api/health", parsed.origin).toString();
  try {
    const response = await fetchImpl(healthUrl, { signal: AbortSignal.timeout(5000) });
    let body;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    if (response.status !== 200 || body?.ok !== true || body?.service !== "renewal-relay") {
      return { ok: false, status: "failed", url: healthUrl, httpStatus: response.status, reason: "Runtime health response did not match the Renewal Relay contract" };
    }
    return { ok: true, status: "verified", verifiedAt: new Date().toISOString(), url: healthUrl, httpStatus: response.status, service: body.service };
  } catch (error) {
    return { ok: false, status: "failed", url: healthUrl, reason: "Runtime health endpoint could not be reached", errorType: error.name || "Error" };
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await verifyRuntime(process.argv[2] || process.env.CLOUD_RUN_URL);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = result.status === "blocked" ? 2 : 1;
}
