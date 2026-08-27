export const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    vendor: { type: "string" },
    plan: { type: "string" },
    amount: { type: "number" },
    currency: { type: "string" },
    renewalDate: { type: "string" },
    cancelByDate: { type: "string" },
    owner: { type: "string" },
    ownerEmail: { type: "string" },
    seats: { type: "number" },
    confidence: { type: "number" },
    missingFacts: { type: "array", items: { type: "string" } }
  },
  required: ["vendor", "plan", "amount", "currency", "renewalDate", "confidence", "missingFacts"]
};

const EXTRACTION_FIELDS = new Set([
  "vendor", "plan", "amount", "currency", "renewalDate", "cancelByDate",
  "owner", "ownerEmail", "seats", "confidence", "missingFacts"
]);
const REQUIRED_FIELDS = ["vendor", "plan", "amount", "currency", "renewalDate", "confidence", "missingFacts"];
const STRING_FIELDS = ["vendor", "plan", "currency", "renewalDate", "cancelByDate", "owner", "ownerEmail"];
const MISSING_FACT_FIELDS = new Set(STRING_FIELDS.concat(["amount", "seats"]));
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MAX_TEXT_LENGTH = 300;

function validationError(detail) {
  throw new Error("Extraction validation failed: " + detail);
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validIsoDate(value) {
  const match = value.match(ISO_DATE);
  if (!match) return false;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.getUTCFullYear() === Number(match[1]) && date.getUTCMonth() + 1 === Number(match[2]) && date.getUTCDate() === Number(match[3]);
}

function requireString(value, field, { allowEmpty = false } = {}) {
  const isBlank = typeof value === "string" && value.trim() === "";
  if (typeof value !== "string" || value.length > MAX_TEXT_LENGTH || (isBlank && (!allowEmpty || value !== ""))) validationError(field + " must be a " + (allowEmpty ? "string" : "non-empty string"));
}

function requireNumber(value, field, { integer = false, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > max || (integer && !Number.isInteger(value))) validationError(field + " must be a finite non-negative " + (integer ? "integer" : "number"));
}

export function validateExtraction(raw) {
  if (!isPlainObject(raw)) validationError("expected a plain object");

  for (const field of Object.keys(raw)) {
    if (!EXTRACTION_FIELDS.has(field)) validationError("unexpected field " + field);
  }
  for (const field of REQUIRED_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(raw, field)) validationError("missing required field " + field);
  }

  for (const field of ["vendor", "plan", "currency", "renewalDate"]) requireString(raw[field], field, { allowEmpty: true });
  for (const field of ["cancelByDate", "owner", "ownerEmail"]) {
    if (raw[field] !== undefined) requireString(raw[field], field, { allowEmpty: true });
  }
  requireNumber(raw.amount, "amount", { max: 1_000_000_000 });
  if (raw.seats !== undefined) requireNumber(raw.seats, "seats", { integer: true, max: 1_000_000 });
  requireNumber(raw.confidence, "confidence", { max: 1 });
  if (raw.currency && !/^[A-Z]{3}$/.test(raw.currency)) validationError("currency must be a three-letter uppercase code");
  for (const field of ["renewalDate", "cancelByDate"]) {
    if (raw[field] && !validIsoDate(raw[field])) validationError(field + " must be a real ISO YYYY-MM-DD date");
  }

  if (!Array.isArray(raw.missingFacts) || raw.missingFacts.length > MISSING_FACT_FIELDS.size) validationError("missingFacts must be a bounded array");
  const missingFacts = [...raw.missingFacts];
  const missing = new Set();
  for (const field of missingFacts) {
    if (typeof field !== "string" || !MISSING_FACT_FIELDS.has(field) || missing.has(field)) validationError("missingFacts contains an invalid or duplicate field");
    missing.add(field);
  }

  const normalized = {
    vendor: raw.vendor,
    plan: raw.plan,
    amount: raw.amount,
    currency: raw.currency,
    renewalDate: raw.renewalDate,
    cancelByDate: raw.cancelByDate ?? "",
    owner: raw.owner ?? "",
    ownerEmail: raw.ownerEmail ?? "",
    seats: raw.seats ?? 0,
    confidence: raw.confidence,
    missingFacts
  };
  const absent = [
    ...(["vendor", "plan", "currency", "renewalDate", "cancelByDate", "owner", "ownerEmail"].filter((field) => normalized[field] === "")),
    ...(normalized.amount === 0 ? ["amount"] : [])
  ];
  for (const field of absent) {
    if (!missing.has(field)) validationError("missingFacts must include absent field " + field);
  }
  for (const field of missing) {
    const value = normalized[field];
    if (value !== "" && !(field === "amount" && value === 0)) validationError("missingFacts marks present field " + field);
  }
  return normalized;
}

export function createGeminiAdapter({ apiKey = process.env.GEMINI_API_KEY, model = process.env.GEMINI_MODEL || "gemini-3.5-flash" } = {}) {
  if (!apiKey) return null;
  let ai;

  return {
    provider: "Gemini 3.5 Flash via Google GenAI SDK",
    async extract(notice) {
      if (!ai) {
        const { GoogleGenAI } = await import("@google/genai");
        ai = new GoogleGenAI({ apiKey });
      }
      const prompt = "You are the extraction worker in Renewal Relay, an operations agent. Extract facts from this renewal notice only. Never invent missing facts. Dates must be ISO YYYY-MM-DD. If a fact is absent, use an empty string and list its field in missingFacts. Return JSON only.\n\nSubject: " + notice.subject + "\nFrom: " + notice.from + "\nReceived: " + notice.receivedAt + "\nBody:\n" + notice.body;
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: EXTRACTION_SCHEMA,
          temperature: 0
        }
      });
      let parsed;
      try {
        parsed = JSON.parse(response.text);
      } catch {
        validationError("Gemini returned invalid JSON");
      }
      return validateExtraction(parsed);
    }
  };
}

export function createDemoAdapter() {
  return {
    provider: "Renewal Relay demo extractor (synthetic data)",
    async extract(notice) {
      const text = notice.subject + " " + notice.body;
      const amountMatch = text.match(/(?:\$|USD\s*)([\d,]+(?:\.\d{2})?)/i);
      const dateMatches = [...text.matchAll(/(?:on|by|before|until)\s+(?:[A-Za-z]+\s+)?(\d{1,2})(?:st|nd|rd|th)?[\s,]+(\d{4})/gi)].filter((match, index, matches) => matches.findIndex((candidate) => candidate[0] === match[0]) === index);
      const monthNames = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
      const isoDate = (match) => {
        if (!match) return "";
        const month = Object.entries(monthNames).find(([name]) => text.toLowerCase().includes(name))?.[1] || 9;
        return match[2] + "-" + String(month).padStart(2, "0") + "-" + String(match[1]).padStart(2, "0");
      };
      const vendor = text.match(/(?:from|at|with)\s+([A-Z][A-Za-z0-9-]+(?:\s+[A-Z][A-Za-z0-9-]+)*)/i)?.[1] || "ZenCloud";
      const ownerEmail = text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0] || "";
      const owner = text.match(/(?:owner|owned by)\s+([A-Z][A-Za-z]+\s+[A-Z][A-Za-z]+)/i)?.[1] || "Samira Chen";
      const seatMatch = text.match(/(\d+)\s+seats?/i);
      const currency = /EUR|€/i.test(text) ? "EUR" : "USD";

      return validateExtraction({
        vendor: vendor.replace(/\s+on$/i, "").trim(),
        plan: text.match(/(?:annual|yearly)\s+([A-Za-z]+)\s+workspace/i)?.[1] + " workspace" || "Pro workspace",
        amount: amountMatch ? Number(amountMatch[1].replace(/,/g, "")) : 0,
        currency,
        renewalDate: isoDate(dateMatches[0]),
        cancelByDate: isoDate(dateMatches[1]),
        owner,
        ownerEmail,
        seats: seatMatch ? Number(seatMatch[1]) : 0,
        confidence: amountMatch && dateMatches.length >= 1 ? 0.96 : 0.61,
        missingFacts: [
          ...(amountMatch ? [] : ["amount"]),
          ...(dateMatches[0] ? [] : ["renewalDate"]),
          ...(ownerEmail ? [] : ["ownerEmail"])
        ]
      });
    }
  };
}
