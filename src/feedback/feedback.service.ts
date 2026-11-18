import { z } from "zod";
import {
  ExtractionSchema,
  FeedbackRecordSchema,
  SubmitInputSchema,
  type Extraction,
  type FeedbackRecord,
} from "../contract";
import type { Extractor } from "../extraction/extractor";
import type { FeedbackRepository } from "./feedback.repository";

/** The model is called once, then once more if its first answer breaks the contract. */
const MAX_ATTEMPTS = 2;

export class InvalidInputError extends Error {
  readonly code = "invalid_input";
}

export class InvalidModelOutputError extends Error {
  readonly code = "invalid_model_output";
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
      const answer = await deps.extractor.extract(text, validationError);
      const parsed = ExtractionSchema.safeParse(answer);
      if (parsed.success) return parsed.data;
      validationError = z.prettifyError(parsed.error);
    }
    throw new InvalidModelOutputError("The model returned content that does not satisfy the contract.");
  }

  return {
    /** Validates the input, extracts, builds the record (the code owns id, time and status) and stores it. */
    async submit(body: unknown): Promise<FeedbackRecord> {
      const input = SubmitInputSchema.safeParse(body);
      if (!input.success) throw new InvalidInputError(z.prettifyError(input.error));

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
