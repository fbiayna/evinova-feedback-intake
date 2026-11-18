import { useCallback, useEffect, useState } from "react";
import { listFeedback } from "./api";
import type { FeedbackRecord } from "./types";

/** Loads the feedback list and lets the caller reload it after a new submission. */
export function useFeedbackList() {
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const reload = useCallback(async () => {
    try {
      setRecords(await listFeedback());
      setError(undefined);
    } catch {
      setError("Could not load the feedback list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { records, loading, error, reload };
}
