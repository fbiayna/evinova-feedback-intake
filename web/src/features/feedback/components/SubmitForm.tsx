import { Alert, Button, Stack, Text, Textarea } from "@mantine/core";
import { useState } from "react";
import { MAX_TEXT_LENGTH } from "@limits";
import { ApiError } from "../../../shared/http";
import { submitFeedback } from "../api";

function messageFor(error: unknown): string {
  if (error instanceof ApiError && error.status === 400) return error.message;
  if (error instanceof ApiError && error.status === 502) {
    return "The AI could not process this feedback. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export function SubmitForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(undefined);
    try {
      await submitFeedback(text);
      setText("");
      onSubmitted();
    } catch (caught) {
      setError(messageFor(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="sm">
        <Textarea
          label="Your feedback"
          placeholder="Tell us what happened or what you would like to see"
          autosize
          minRows={3}
          maxLength={MAX_TEXT_LENGTH}
          value={text}
          onChange={(event) => setText(event.currentTarget.value)}
          description={`${text.length} / ${MAX_TEXT_LENGTH}`}
        />
        <Text size="xs" c="dimmed">
          Your feedback is stored and analysed by an AI model.
        </Text>
        {error && (
          <Alert color="red" role="alert">
            {error}
          </Alert>
        )}
        <Button type="submit" loading={submitting} disabled={text.trim().length === 0}>
          Send feedback
        </Button>
      </Stack>
    </form>
  );
}
