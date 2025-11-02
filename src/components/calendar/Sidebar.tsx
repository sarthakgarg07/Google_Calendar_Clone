import { format, isAfter, isSameDay, parseISO } from "date-fns";
import { Plus } from "lucide-react";

import { MiniCalendar } from "@/components/calendar/MiniCalendar";
import type { CalendarEvent } from "@/types/events";

interface SidebarProps {
  monthAnchor: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  onCreate: () => void;
  onSelectDate: (date: Date) => void;
  onChangeMonth: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export function Sidebar({
  monthAnchor,
  selectedDate,
  events,
  onCreate,
  onSelectDate,
  onChangeMonth,
  onSelectEvent,
}: SidebarProps) {
  const upcoming = events
    .map((event) => ({
      event,
      start: parseISO(event.start),
    }))
    .filter(({ start }) => isAfter(start, new Date()) || isSameDay(start, new Date()))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);

  return (
    <aside className="flex w-full flex-col gap-6 rounded-3xl bg-[#f8fbff] p-6 shadow-inner lg:w-80">
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
      >
        <Plus className="h-4 w-4" />
        Create
      </button>

      <MiniCalendar
        monthAnchor={monthAnchor}
        selectedDate={selectedDate}
        onChangeMonth={onChangeMonth}
        onSelect={onSelectDate}
      />

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Upcoming
        </p>
        <div className="mt-3 space-y-3">
          {upcoming.length === 0 && (
            <p className="rounded-xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-500">
              No upcoming events. Click Create to add one.
            </p>
          )}
          {upcoming.map(({ event, start }) => (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelectEvent(event)}
              className="w-full rounded-xl border border-transparent bg-white p-4 text-left shadow-sm transition hover:border-blue-100 hover:shadow-md"
            >
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="font-medium uppercase tracking-wide">
                  {format(start, "EEE, MMM d")}
                </span>
                <span>{event.allDay ? "All day" : format(start, "h:mm a")}</span>
              </div>
              <p
                className="mt-2 text-sm font-semibold"
                style={{ color: event.color }}
              >
                {event.title}
              </p>
              {event.location && (
                <p className="mt-1 text-xs text-gray-500">{event.location}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
