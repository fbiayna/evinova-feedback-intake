import { Paper, SimpleGrid, Text } from "@mantine/core";
import { CATEGORY_LABEL } from "../presentation";
import { CATEGORIES, countByCategory } from "../stats";
import type { FeedbackRecord } from "../types";

export function CategoryCounts({ records }: { records: FeedbackRecord[] }) {
  const counts = countByCategory(records);

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }}>
      {CATEGORIES.map((category) => (
        <Paper key={category} withBorder p="md">
          <Text size="sm" c="dimmed">
            {CATEGORY_LABEL[category]}
          </Text>
          <Text size="xl" fw={700} aria-label={`${CATEGORY_LABEL[category]} count`}>
            {counts[category]}
          </Text>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
