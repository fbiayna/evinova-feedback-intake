import type { Category, Sentiment, Severity } from "./types";

// Record<...> stops compiling if the contract gets a value that is not handled here.
export const CATEGORY_LABEL: Record<Category, string> = {
  bug: "Bugs",
  feature_request: "Feature requests",
  praise: "Praise",
  other: "Other",
};

export const SEVERITY_COLOR: Record<Severity, string> = { low: "gray", medium: "yellow", high: "red" };

export const SENTIMENT_COLOR: Record<Sentiment, string> = {
  positive: "green",
  neutral: "gray",
  negative: "red",
};

export function formatCategory(category: Category): string {
  return category.replace("_", " ");
}
