import useSWR from "swr";

import type { CalendarEvent } from "@/types/events";

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load events");
  }
  return response.json() as Promise<CalendarEvent[]>;
};

export function useEvents(start: Date, end: Date) {
  const key = `/api/events?start=${start.toISOString()}&end=${end.toISOString()}`;

  const { data, error, isLoading, mutate } = useSWR<CalendarEvent[]>(
    key,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 60_000,
    }
  );

  return {
    events: data ?? [],
    isLoading,
    error,
    mutate,
  };
}
