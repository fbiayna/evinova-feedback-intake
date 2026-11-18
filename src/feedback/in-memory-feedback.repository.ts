import type { FeedbackRecord } from "../contract";
import type { FeedbackRepository } from "./feedback.repository";

export class InMemoryFeedbackRepository implements FeedbackRepository {
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
