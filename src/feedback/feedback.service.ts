import { z } from "zod";
import {
  ExtractionSchema,
  FeedbackRecordSchema,
  SubmitInputSchema,
  type Extraction,
  type FeedbackRecord,
} from "../contract";
import type { Extractor } from "../extraction/extractor";
import { MAX_TEXT_LENGTH } from "../limits";
import type { FeedbackRepository } from "./feedback.repository";

// One call, plus one retry if the answer breaks the contract.
const MAX_ATTEMPTS = 2;

export class InvalidInputError extends Error {
  readonly code = "invalid_input";
}

export class InvalidModelOutputError extends Error {
  readonly code = "invalid_model_output";
}

// The AI provider failed (network, timeout, rate limit).
export class ExtractionFailedError extends Error {
  readonly code = "extraction_failed";
}

export interface FeedbackServiceDependencies {
  extractor: Extractor;
  repository: FeedbackRepository;
  now: () => Date;
  newId: () => string;
}

export function createFeedbackService(deps: FeedbackServiceDependencies) {
  async function extractValid(text: string): Promise<Extraction> {
    let validationError: string | undefined;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      let answer: unknown;
      try {
        answer = await deps.extractor.extract(text, validationError);
      } catch (error) {
        throw new ExtractionFailedError("The AI service is not available. Please try again.", { cause: error });
      }
      const parsed = ExtractionSchema.safeParse(answer);
      if (parsed.success) return parsed.data;
      validationError = z.prettifyError(parsed.error);
    }
    throw new InvalidModelOutputError("The model returned content that does not satisfy the contract.");
  }

  return {
    async submit(body: unknown): Promise<FeedbackRecord> {
      const input = SubmitInputSchema.safeParse(body);
      if (!input.success) {
        throw new InvalidInputError(`Send a "text" of 1 to ${MAX_TEXT_LENGTH} characters.`);
      }

      const extraction = await extractValid(input.data.text);
      const record = FeedbackRecordSchema.parse({
        id: deps.newId(),
        submittedAt: deps.now().toISOString(),
        status: "new",
        text: input.data.text,
        ...extraction,
      });
      await deps.repository.save(record);
      return record;
    },
    list: () => deps.repository.list(),
    get: (id: string) => deps.repository.get(id),
  };
}

export type FeedbackService = ReturnType<typeof createFeedbackService>;
