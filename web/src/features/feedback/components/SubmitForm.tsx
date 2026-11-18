import { Alert, Button, Stack, Text, Textarea } from "@mantine/core";
import { MAX_TEXT_LENGTH } from "@limits";
import { useState } from "react";
import { useSubmitFeedback } from "../useSubmitFeedback";

export function SubmitForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [text, setText] = useState("");
  const { submit, submitting, error } = useSubmitFeedback(onSubmitted);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (await submit(text)) setText("");
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
