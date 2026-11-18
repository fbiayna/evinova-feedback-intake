import type { FeedbackRecord } from "./contract";

/** Where records are kept. In memory here; DynamoDB would implement the same interface. */
export interface FeedbackRepository {
  save(record: FeedbackRecord): Promise<void>;
  /** Newest first. */
  list(): Promise<FeedbackRecord[]>;
  get(id: string): Promise<FeedbackRecord | undefined>;
}

export class InMemoryRepository implements FeedbackRepository {
  private readonly records: FeedbackRecord[] = [];

  async save(record: FeedbackRecord): Promise<void> {
    this.records.push(record);
  }

  async list(): Promise<FeedbackRecord[]> {
    return [...this.records].reverse();
  }

  async get(id: string): Promise<FeedbackRecord | undefined> {
    return this.records.find((record) => record.id === id);
  }
}
