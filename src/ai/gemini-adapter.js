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
      return JSON.parse(response.text);
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

      return {
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
      };
    }
  };
}
