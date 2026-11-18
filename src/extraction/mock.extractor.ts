import type { Extractor } from "./extractor";

/** Offline stand-in for the model: simple keyword rules, always the same answer for the same text. */
export class MockExtractor implements Extractor {
  async extract(text: string): Promise<unknown> {
    const lower = text.toLowerCase();
    const summary = firstSentence(text);

    if (/(crash|error|bug|broken|fails?|not working|doesn't work)/.test(lower)) {
      return {
        category: "bug",
        sentiment: "negative",
        severity: /(crash|data loss|cannot|can't)/.test(lower) ? "high" : "medium",
        summary,
        suggestedAction: "Reproduce the problem and open a bug ticket.",
      };
    }
    if (/(please add|would be nice|feature|could you|wish)/.test(lower)) {
      return {
        category: "feature_request",
        sentiment: "neutral",
        severity: "low",
        summary,
        suggestedAction: "Add the request to the product backlog for review.",
      };
    }
    if (/(love|great|thanks|thank you|awesome|excellent)/.test(lower)) {
      return {
        category: "praise",
        sentiment: "positive",
        severity: "low",
        summary,
        suggestedAction: "Share the feedback with the team.",
      };
    }
    return {
      category: "other",
      sentiment: "neutral",
      severity: "low",
      summary,
      suggestedAction: "Review the feedback and decide on a next step.",
    };
  }
}

function firstSentence(text: string): string {
  const sentence = text.split(/(?<=[.!?])\s/)[0] ?? text;
  return sentence.length > 120 ? `${sentence.slice(0, 117)}...` : sentence;
}
