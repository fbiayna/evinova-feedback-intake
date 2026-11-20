import { z } from "zod";
import { MAX_TEXT_LENGTH } from "./limits";

export const Category = z.enum(["bug", "feature_request", "praise", "other"]);
export const Sentiment = z.enum(["positive", "neutral", "negative"]);
export const Severity = z.enum(["low", "medium", "high"]);
export const Status = z.enum(["new", "triaged", "resolved"]);

export const SubmitInputSchema = z.object({
  text: z.string().trim().min(1).max(MAX_TEXT_LENGTH),
});

// Only the fields the model may produce.
export const ExtractionSchema = z.object({
  category: Category,
  sentiment: Sentiment,
  severity: Severity,
  summary: z.string().trim().min(1).max(200),
  suggestedAction: z.string().trim().min(1).max(300),
});

// The code owns id, submittedAt, status and text.
export const FeedbackRecordSchema = ExtractionSchema.extend({
  id: z.string().regex(/^fb_[0-9a-f-]{36}$/),
  submittedAt: z.iso.datetime(),
  status: Status,
  text: z.string(),
});

export type Extraction = z.infer<typeof ExtractionSchema>;
export type FeedbackRecord = z.infer<typeof FeedbackRecordSchema>;
