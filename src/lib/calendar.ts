import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import type { CalendarView } from "@/types/events";

const weekOptions = { weekStartsOn: 0 };

export function startOfView(date: Date, view: CalendarView) {
  switch (view) {
    case "day":
      return startOfDay(date);
    case "week":
      return startOfWeek(date, weekOptions);
    case "month":
    default:
      return startOfWeek(startOfMonth(date), weekOptions);
  }
}

export function endOfView(date: Date, view: CalendarView) {
  switch (view) {
    case "day":
      return endOfDay(date);
    case "week":
      return endOfWeek(date, weekOptions);
    case "month":
    default:
      return endOfWeek(endOfMonth(date), weekOptions);
  }
}

export function getMonthMatrix(anchor: Date) {
  const start = startOfView(anchor, "month");
  const end = endOfView(anchor, "month");
  const weeks: Date[][] = [];
  let current = start;

  while (current <= end) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i += 1) {
      week.push(current);
      current = addDays(current, 1);
    }
    weeks.push(week);
  }

  return weeks;
}

export function getWeekDays(anchor: Date) {
  const start = startOfWeek(anchor, weekOptions);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function moveDate(date: Date, view: CalendarView, direction: 1 | -1) {
  switch (view) {
    case "day":
      return addDays(date, direction);
    case "week":
      return addWeeks(date, direction);
    case "month":
    default:
      return addMonths(date, direction);
  }
}

export function viewLabel(date: Date, view: CalendarView) {
  if (view === "day") {
    return format(date, "EEEE, MMMM d");
  }
  if (view === "week") {
    const start = startOfWeek(date, weekOptions);
    const end = endOfWeek(date, weekOptions);
    if (start.getMonth() === end.getMonth()) {
      return `${format(start, "MMMM d")} – ${format(end, "d, yyyy")}`;
    }
    if (start.getFullYear() === end.getFullYear()) {
      return `${format(start, "MMMM d")} – ${format(end, "MMMM d, yyyy")}`;
    }
    return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
  }
  return format(date, "MMMM yyyy");
}

export function previousDate(date: Date, view: CalendarView) {
  return moveDate(date, view, -1);
}

export function nextDate(date: Date, view: CalendarView) {
  return moveDate(date, view, 1);
}
