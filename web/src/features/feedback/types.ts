import type { FeedbackRecord } from "@contract";

// Derived from the API contract.
export type { FeedbackRecord };
export type Category = FeedbackRecord["category"];
export type Sentiment = FeedbackRecord["sentiment"];
export type Severity = FeedbackRecord["severity"];
