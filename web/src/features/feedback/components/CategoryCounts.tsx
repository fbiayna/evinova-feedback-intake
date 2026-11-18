import { Paper, SimpleGrid, Text } from "@mantine/core";
import type { Category, FeedbackRecord } from "../types";

// Record<Category, ...> makes the compiler fail if the contract gains a category that is not listed here.
const LABELS: Record<Category, string> = {
  bug: "Bugs",
  feature_request: "Feature requests",
  praise: "Praise",
  other: "Other",
};

/** The aggregate view: how many records per category. Computed here from the list. */
export function CategoryCounts({ records }: { records: FeedbackRecord[] }) {
  const counts: Record<Category, number> = { bug: 0, feature_request: 0, praise: 0, other: 0 };
  for (const record of records) counts[record.category] += 1;

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }}>
      {(Object.keys(LABELS) as Category[]).map((category) => (
        <Paper key={category} withBorder p="md">
          <Text size="sm" c="dimmed">
            {LABELS[category]}
          </Text>
          <Text size="xl" fw={700} aria-label={`${LABELS[category]} count`}>
            {counts[category]}
          </Text>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
