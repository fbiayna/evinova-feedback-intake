import type { Category, FeedbackRecord } from "./types";

export const CATEGORIES: readonly Category[] = ["bug", "feature_request", "praise", "other"];

export function countByCategory(records: readonly FeedbackRecord[]): Record<Category, number> {
  const counts: Record<Category, number> = { bug: 0, feature_request: 0, praise: 0, other: 0 };
  for (const record of records) counts[record.category] += 1;
  return counts;
}
