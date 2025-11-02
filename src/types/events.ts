export type CalendarView = "month" | "week" | "day";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  color: string;
  allDay: boolean;
  start: string;
  end: string;
  timeZone: string;
  createdAt: string;
  updatedAt: string;
}
