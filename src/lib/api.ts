import type { EventInput } from "@/lib/validation";
import type { CalendarEvent } from "@/types/events";

async function handleResponse<T>(response: Response) {
  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = await response.json();
      message = body?.error ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function createEvent(input: EventInput) {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<CalendarEvent>(response);
}

export async function updateEvent(id: string, input: Partial<EventInput>) {
  const response = await fetch(`/api/events/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<CalendarEvent>(response);
}

export async function deleteEvent(id: string) {
  const response = await fetch(`/api/events/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete event");
  }
}
