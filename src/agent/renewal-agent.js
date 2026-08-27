import { randomUUID } from "node:crypto";
import { DEFAULT_POLICY, evaluateRenewal } from "../domain/policy.js";

const SAMPLE_NOTICE = {
  id: "notice_zencloud_2026",
  subject: "Action required: ZenCloud annual renewal on September 12, 2026",
  from: "renewals@zencloud.example",
  receivedAt: "2026-08-27T08:30:00Z",
  body: "Your ZenCloud annual Pro workspace renews on September 12, 2026 for $1,440 USD (12 seats). Cancel before September 5, 2026 to avoid the charge. Account owner Samira Chen (samira@example.com). Reply to this email if you need help."
};

const pause = (ms) => ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();

function nowIso() {
  return new Date().toISOString();
}

function action(id, type, title, detail, status = "prepared", metadata = {}) {
  return { id, type, title, detail, status, metadata };
}

export function createRenewalAgent({ adapter, policy = DEFAULT_POLICY, stepDelayMs = Number(process.env.AGENT_STEP_DELAY_MS || 180) } = {}) {
  if (!adapter) throw new Error("An extraction adapter is required");

  return {
    sampleNotice: SAMPLE_NOTICE,
    async run(notice, { runId = "run_" + randomUUID(), onProgress = async () => {} } = {}) {
      const createdAt = nowIso();
      const timeline = [];
      const emit = async (step, label, detail, state = "complete", extra = {}) => {
        const event = { id: step + "_" + (timeline.length + 1), step, label, detail, state, at: nowIso(), ...extra };
        timeline.push(event);
        await onProgress({ runId, createdAt, status: state === "failed" ? "failed" : "running", timeline: [...timeline], provider: adapter.provider });
        await pause(stepDelayMs);
      };

      const base = { id: runId, createdAt, status: "running", notice, timeline, provider: adapter.provider };
      await onProgress(base);
      try {
        await emit("intake", "Notice received", "Captured " + notice.from + " without forwarding or changing the source message.");
        const extraction = await adapter.extract(notice);
        await emit("extract", "Facts extracted", (extraction.vendor || "Unknown vendor") + " · " + (extraction.currency || "USD") + " " + Number(extraction.amount || 0).toLocaleString() + " · renews " + (extraction.renewalDate || "date missing"), "complete", { confidence: extraction.confidence });
        const decision = evaluateRenewal(extraction, policy);
        await emit("policy", "Policy checked", decision.status.replaceAll("_", " ") + " · " + decision.passedChecks + "/" + decision.totalChecks + " checks passed · " + decision.risk + " risk", "complete", { decision });

        const actions = [
          action("calendar_hold", "calendar", "Calendar hold created", "Renewal review · " + (extraction.vendor || "vendor") + " · " + (extraction.renewalDate || "date to confirm"), "created", { date: extraction.renewalDate }),
          action("approval_task", "task", "Approval task routed", "Assigned to " + policy.owner + "; due " + (extraction.cancelByDate || extraction.renewalDate || "date to confirm"), "created", { assignee: policy.ownerEmail, dueDate: extraction.cancelByDate || extraction.renewalDate }),
          action("vendor_draft", "draft", "Vendor reply drafted", decision.status === "REVIEW_REQUIRED" ? "Asks for confirmation before any renewal or cancellation." : "Requests final approval before the renewal is committed.", "drafted", { sendable: false }),
          action("audit_record", "audit", "Audit record written", "Stores source, extracted facts, policy result, and all reversible actions.", "recorded", { immutable: true })
        ];
        await emit("act", "Actions executed", actions.length + " reversible actions staged; no external message was sent.", "complete", { actions });
        const completedAt = nowIso();
        const result = { ...base, status: "complete", completedAt, extraction, decision, actions, timeline: [...timeline], guardrails: ["No auto-send", "No auto-cancel", "Human approval required for financial commitment", "Synthetic notice data only"] };
        await onProgress(result);
        return result;
      } catch (error) {
        const failed = { ...base, status: "failed", completedAt: nowIso(), error: error.message, timeline: [...timeline, { id: "failure_" + (timeline.length + 1), step: "failure", label: "Run stopped safely", detail: error.message, state: "failed", at: nowIso() }] };
        await onProgress(failed);
        return failed;
      }
    }
  };
}

export { SAMPLE_NOTICE };
