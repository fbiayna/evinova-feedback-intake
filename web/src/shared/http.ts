/** A failed API call: carries the error code and message from the API's `{ error: { code, message } }` body. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const error = (body as { error?: { code?: string; message?: string } } | undefined)?.error;
    throw new ApiError(error?.message ?? "Unexpected error", error?.code ?? "unknown", response.status);
  }
  return body as T;
}
