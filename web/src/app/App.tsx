import { Alert, Container, Loader, Paper, Stack, Title } from "@mantine/core";
import { CategoryCounts, RecordsTable, SubmitForm, useFeedbackList } from "../features/feedback";

export function App() {
  const { records, loading, error, reload } = useFeedbackList();

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Title order={2}>Feedback Intake</Title>
        <Paper withBorder p="md">
          <SubmitForm onSubmitted={reload} />
        </Paper>
        <CategoryCounts records={records} />
        {error && (
          <Alert color="red" role="alert">
            {error}
          </Alert>
        )}
        <Paper withBorder p="md">
          {loading ? <Loader size="sm" /> : <RecordsTable records={records} />}
        </Paper>
      </Stack>
    </Container>
  );
}
