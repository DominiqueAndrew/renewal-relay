import { randomUUID } from "node:crypto";
import { DEFAULT_POLICY, evaluateRenewal } from "../domain/policy.js";
import { validateExtraction } from "../ai/gemini-adapter.js";

const SAMPLE_NOTICE = {
  id: "notice_zencloud_2026",
  subject: "Action required: ZenCloud annual renewal on September 12, 2026",
  from: "renewals@zencloud.example",
  receivedAt: "2026-08-27T08:30:00Z",
  body: "Your ZenCloud annual Pro workspace renews on September 12, 2026 for $1,440 USD (12 seats). Cancel before September 5, 2026 to avoid the charge. Account owner Samira Chen (samira@example.com). Reply to this email if you need help."
};

const pause = (ms) => ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();

function action(runId, id, type, title, detail, status = "prepared", metadata = {}) {
  return {
    id,
    type,
    title,
    detail,
    status,
    metadata: {
      ...metadata,
      idempotencyKey: "renewal-relay:" + runId + ":" + id,
      execution: "record_only",
      retrySafe: true
    }
  };
}

export function createRenewalAgent({ adapter, policy = DEFAULT_POLICY, stepDelayMs = Number(process.env.AGENT_STEP_DELAY_MS || 180), clock = () => new Date() } = {}) {
  if (!adapter) throw new Error("An extraction adapter is required");

  return {
    sampleNotice: SAMPLE_NOTICE,
    async run(notice, { runId = "run_" + randomUUID(), onProgress = async () => {} } = {}) {
      const createdAt = clock().toISOString();
      const timeline = [];
      const emit = async (step, label, detail, state = "complete", extra = {}) => {
        const event = { id: step + "_" + (timeline.length + 1), step, label, detail, state, at: clock().toISOString(), ...extra };
        timeline.push(event);
        await onProgress({ runId, createdAt, status: state === "failed" ? "failed" : "running", timeline: [...timeline], provider: adapter.provider });
        await pause(stepDelayMs);
      };

      const base = { id: runId, createdAt, status: "running", notice, timeline, provider: adapter.provider };
      await onProgress(base);
      try {
        await emit("intake", "Notice received", "Captured " + notice.from + " without forwarding or changing the source message.");
        const extraction = validateExtraction(await adapter.extract(notice));
        await emit("extract", "Facts extracted", (extraction.vendor || "Unknown vendor") + " · " + (extraction.currency || "USD") + " " + Number(extraction.amount || 0).toLocaleString() + " · renews " + (extraction.renewalDate || "date missing"), "complete", { confidence: extraction.confidence });
        const decision = evaluateRenewal(extraction, policy, clock());
        await emit("policy", "Policy checked", decision.status.replaceAll("_", " ") + " · " + decision.passedChecks + "/" + decision.totalChecks + " checks passed · " + decision.risk + " risk", "complete", { decision });

        const actions = [
          action(runId, "calendar_hold", "calendar", "Calendar hold staged", "Prepared a renewal review hold · " + (extraction.vendor || "vendor") + " · " + (extraction.renewalDate || "date to confirm"), "staged", { date: extraction.renewalDate }),
          action(runId, "approval_task", "task", "Approval task staged", "Prepared for " + policy.owner + "; due " + (extraction.cancelByDate || extraction.renewalDate || "date to confirm"), "staged", { assignee: policy.ownerEmail, dueDate: extraction.cancelByDate || extraction.renewalDate }),
          action(runId, "vendor_draft", "draft", "Vendor reply drafted", decision.status === "REVIEW_REQUIRED" ? "Asks for confirmation before any renewal or cancellation." : "Requests final approval before the renewal is committed.", "drafted", { sendable: false }),
          action(runId, "audit_record", "audit", "Audit record written", "Stores source, extracted facts, policy result, and all reversible actions.", "recorded", { immutable: true })
        ];
        await emit("act", "Actions staged", actions.length + " reversible action records prepared; no external message was sent.", "complete", { actions });
        const completedAt = clock().toISOString();
        const result = { ...base, status: "complete", completedAt, extraction, decision, actions, timeline: [...timeline], guardrails: ["No auto-send", "No auto-cancel", "Human approval required for financial commitment", "Synthetic notice data only"] };
        await onProgress(result);
        return result;
      } catch (error) {
        const failed = { ...base, status: "failed", completedAt: clock().toISOString(), error: error.message, timeline: [...timeline, { id: "failure_" + (timeline.length + 1), step: "failure", label: "Run stopped safely", detail: error.message, state: "failed", at: clock().toISOString() }] };
        await onProgress(failed);
        return failed;
      }
    }
  };
}

export { SAMPLE_NOTICE };
