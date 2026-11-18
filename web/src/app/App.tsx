import { Alert, Container, Loader, Paper, Stack, Title } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { listFeedback } from "../features/feedback/api";
import { CategoryCounts } from "../features/feedback/components/CategoryCounts";
import { RecordsTable } from "../features/feedback/components/RecordsTable";
import { SubmitForm } from "../features/feedback/components/SubmitForm";
import type { FeedbackRecord } from "../features/feedback/types";

export function App() {
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();

  const load = useCallback(async () => {
    try {
      setRecords(await listFeedback());
      setLoadError(undefined);
    } catch {
      setLoadError("Could not load the feedback list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Title order={2}>Feedback Intake</Title>
        <Paper withBorder p="md">
          <SubmitForm onSubmitted={load} />
        </Paper>
        <CategoryCounts records={records} />
        {loadError && (
          <Alert color="red" role="alert">
            {loadError}
          </Alert>
        )}
        <Paper withBorder p="md">
          {loading ? <Loader size="sm" /> : <RecordsTable records={records} />}
        </Paper>
      </Stack>
    </Container>
  );
}
