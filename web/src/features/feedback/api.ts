import { request } from "../../shared/http";
import type { FeedbackRecord } from "./types";

export function listFeedback(): Promise<FeedbackRecord[]> {
  return request<FeedbackRecord[]>("/feedback");
}

export function submitFeedback(text: string): Promise<FeedbackRecord> {
  return request<FeedbackRecord>("/feedback", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
}
