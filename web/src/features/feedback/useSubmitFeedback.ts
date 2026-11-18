import { useState } from "react";
import { ApiError } from "../../shared/http";
import { submitFeedback } from "./api";

function messageFor(error: unknown): string {
  if (error instanceof ApiError && error.status === 400) return error.message;
  if (error instanceof ApiError && error.status === 502) {
    return "The AI could not process this feedback. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

/** Sends one feedback text. `submit` resolves to true when it was accepted. */
export function useSubmitFeedback(onSubmitted: () => void) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(text: string): Promise<boolean> {
    setSubmitting(true);
    setError(undefined);
    try {
      await submitFeedback(text);
      onSubmitted();
      return true;
    } catch (caught) {
      setError(messageFor(caught));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return { submit, submitting, error };
}
