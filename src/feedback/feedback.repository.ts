import type { FeedbackRecord } from "../contract";

/** Where records are kept. In memory here; DynamoDB would implement the same interface. */
export interface FeedbackRepository {
  save(record: FeedbackRecord): Promise<void>;
  /** Newest first. */
  list(): Promise<FeedbackRecord[]>;
  get(id: string): Promise<FeedbackRecord | undefined>;
}
