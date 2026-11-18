import { Badge, Table, Text } from "@mantine/core";
import type { FeedbackRecord } from "../../src/contract";

type Severity = FeedbackRecord["severity"];
type Sentiment = FeedbackRecord["sentiment"];

const NO_WRAP = { whiteSpace: "nowrap" } as const;

// Record<...> makes the compiler fail if the contract gains a value that is not handled here.
const SEVERITY_COLOR: Record<Severity, string> = { low: "gray", medium: "yellow", high: "red" };
const SENTIMENT_COLOR: Record<Sentiment, string> = { positive: "green", neutral: "gray", negative: "red" };

export function RecordsTable({ records }: { records: FeedbackRecord[] }) {
  if (records.length === 0) {
    return <Text c="dimmed">No feedback yet. Send the first one above.</Text>;
  }

  return (
    <Table.ScrollContainer minWidth={900}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Submitted</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Sentiment</Table.Th>
            <Table.Th>Severity</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Summary</Table.Th>
            <Table.Th>Suggested action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {records.map((record) => (
            <Table.Tr key={record.id}>
              <Table.Td style={NO_WRAP}>{new Date(record.submittedAt).toLocaleString()}</Table.Td>
              <Table.Td style={NO_WRAP}>
                <Badge variant="light" w="max-content">{record.category.replace("_", " ")}</Badge>
              </Table.Td>
              <Table.Td style={NO_WRAP}>
                <Badge variant="light" w="max-content" color={SENTIMENT_COLOR[record.sentiment]}>
                  {record.sentiment}
                </Badge>
              </Table.Td>
              <Table.Td style={NO_WRAP}>
                <Badge w="max-content" color={SEVERITY_COLOR[record.severity]}>{record.severity}</Badge>
              </Table.Td>
              <Table.Td>{record.status}</Table.Td>
              <Table.Td>{record.summary}</Table.Td>
              <Table.Td>{record.suggestedAction}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
