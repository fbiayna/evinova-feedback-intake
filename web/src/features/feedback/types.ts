import type { FeedbackRecord } from "@contract";

// Derived from the API contract, so the web app can never drift from the backend.
export type { FeedbackRecord };
export type Category = FeedbackRecord["category"];
export type Sentiment = FeedbackRecord["sentiment"];
export type Severity = FeedbackRecord["severity"];
