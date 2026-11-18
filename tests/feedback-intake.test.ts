import { describe, it, expect } from "vitest";
import { createApp } from "../src/app";
import { FeedbackRecordSchema } from "../src/contract";
import type { Extractor } from "../src/extractor";

const FIXED_NOW = new Date("2026-06-29T10:00:00Z");
const FIXED_ID = "fb_00000000-0000-4000-8000-000000000001";

const validAnswer = {
  category: "bug",
  sentiment: "negative",
  severity: "high",
  summary: "Export button crashes the app when clicked twice.",
  suggestedAction: "Reproduce the double click on export and fix the crash.",
};

/** An extractor that returns the given answers in order and records how it was called. */
function scriptedExtractor(answers: unknown[]) {
  const validationErrors: Array<string | undefined> = [];
  const extractor: Extractor = {
    async extract(_text, validationError) {
      validationErrors.push(validationError);
      return answers[Math.min(validationErrors.length - 1, answers.length - 1)];
    },
  };
  return { extractor, validationErrors };
}

function appWith(extractor: Extractor) {
  return createApp({ extractor, now: () => FIXED_NOW, newId: () => FIXED_ID });
}

describe("Feedback intake", () => {
  it("A valid submission produces a conforming record", async () => {
    const { extractor } = scriptedExtractor([validAnswer]);
    const app = appWith(extractor);

    const response = await app.inject({
      method: "POST",
      url: "/feedback",
      payload: { text: "  The export button crashes the app when I click it twice.  " },
    });

    expect(response.statusCode).toBe(201);
    const record = FeedbackRecordSchema.parse(response.json());
    expect(record.id).toBe(FIXED_ID);
    expect(record.submittedAt).toBe("2026-06-29T10:00:00.000Z");
    expect(record.status).toBe("new");
    expect(record.text).toBe("The export button crashes the app when I click it twice.");
    expect(record).toMatchObject(validAnswer);

    const fetched = await app.inject({ method: "GET", url: `/feedback/${record.id}` });
    expect(fetched.statusCode).toBe(200);
    expect(fetched.json()).toEqual(record);

    const list = await app.inject({ method: "GET", url: "/feedback" });
    expect(list.json()).toEqual([record]);
  });

  it("The model returns content that breaks the contract", async () => {
    const { extractor, validationErrors } = scriptedExtractor([
      { ...validAnswer, severity: "critical" },
    ]);
    const app = appWith(extractor);

    const response = await app.inject({
      method: "POST",
      url: "/feedback",
      payload: { text: "The export button crashes the app." },
    });

    expect(response.statusCode).toBe(502);
    expect(response.json().error.code).toBe("invalid_model_output");
    // One retry, and the retry carries the validation error.
    expect(validationErrors).toHaveLength(2);
    expect(validationErrors[0]).toBeUndefined();
    expect(validationErrors[1]).toEqual(expect.any(String));

    const list = await app.inject({ method: "GET", url: "/feedback" });
    expect(list.json()).toEqual([]);
  });

  it("Invalid input is rejected before reaching the model", async () => {
    const { extractor, validationErrors } = scriptedExtractor([validAnswer]);
    const app = appWith(extractor);

    for (const text of ["", "   ", "x".repeat(2001)]) {
      const response = await app.inject({
        method: "POST",
        url: "/feedback",
        payload: { text },
      });
      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe("invalid_input");
    }

    expect(validationErrors).toHaveLength(0);
  });
});
