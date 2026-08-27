import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const SECRET_PATTERNS = [
  { id: "private-key", pattern: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/ },
  { id: "google-api-key", pattern: /\bAIza[0-9A-Za-z_-]{20,}\b/ },
  { id: "github-token", pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/ },
  { id: "github-pat", pattern: /\bgithub_pat_[A-Za-z0-9_]{30,}\b/ },
  { id: "openai-key", pattern: /\bsk-[A-Za-z0-9]{30,}\b/ },
  { id: "google-oauth-token", pattern: /\bya29\.[0-9A-Za-z._-]{20,}\b/ }
];

export function findSecretPatterns(text) {
  return SECRET_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ id }) => id);
}

export async function scanTrackedFiles(fileNames, readFileImpl = readFile) {
  const findings = [];
  for (const fileName of fileNames) {
    const text = await readFileImpl(fileName, "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const pattern of findSecretPatterns(line)) findings.push({ file: fileName, line: index + 1, pattern });
    });
  }
  return findings;
}

async function trackedFiles() {
  const { stdout } = await execFileAsync("git", ["ls-files", "-z"]);
  return stdout.split("\0").filter(Boolean);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = await trackedFiles();
  const findings = await scanTrackedFiles(files);
  console.log(JSON.stringify({ ok: findings.length === 0, filesScanned: files.length, findings }, null, 2));
  if (findings.length > 0) process.exitCode = 1;
}
