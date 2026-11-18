import type { FeedbackRecord } from "../../src/contract";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const error = (body as { error?: { code?: string; message?: string } } | undefined)?.error;
    throw new ApiError(error?.message ?? "Unexpected error", error?.code ?? "unknown", response.status);
  }
  return body as T;
}

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
