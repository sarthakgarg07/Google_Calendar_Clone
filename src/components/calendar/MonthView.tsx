import { format, isSameMonth, isToday, startOfDay, endOfDay } from "date-fns";
import { useMemo } from "react";

import { getMonthMatrix } from "@/lib/calendar";
import type { CalendarEvent } from "@/types/events";

interface MonthViewProps {
  anchor: Date;
  events: CalendarEvent[];
  onCreate: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onDrillDown: (date: Date) => void;
}

function eventsForDay(events: CalendarEvent[], day: Date) {
  const start = startOfDay(day);
  const end = endOfDay(day);

  return events
    .map((event) => ({
      ...event,
      startDate: new Date(event.start),
      endDate: new Date(event.end),
    }))
    .filter(
      ({ startDate, endDate }) =>
        startDate <= end && endDate >= start
    )
    .sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );
}

export function MonthView({
  anchor,
  events,
  onCreate,
  onSelectEvent,
  onDrillDown,
}: MonthViewProps) {
  const monthMatrix = useMemo(() => getMonthMatrix(anchor), [anchor]);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="grid grid-cols-7 border-b border-gray-100 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
          (label) => (
            <div key={label} className="px-4 py-3">
              {label}
            </div>
          )
        )}
      </div>
      <div className="grid grid-cols-7">
        {monthMatrix.map((week, weekIndex) => (
          <div key={weekIndex} className="contents">
            {week.map((day) => {
              const dayEvents = eventsForDay(events, day);
              const visible = dayEvents.slice(0, 3);
              const hiddenCount = dayEvents.length - visible.length;
              const sameMonth = isSameMonth(day, anchor);

              return (
                <div
                  key={day.toISOString()}
                  onDoubleClick={() => onCreate(day)}
                  className="relative min-h-[120px] border-r border-b border-gray-100 px-3 py-2 transition hover:bg-blue-50/50"
                >
                  <button
                    type="button"
                    onClick={() => onDrillDown(day)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                      isToday(day)
                        ? "bg-blue-600 text-white shadow"
                        : sameMonth
                        ? "text-gray-800"
                        : "text-gray-300"
                    }`}
                  >
                    {format(day, "d")}
                  </button>

                  <div className="mt-2 space-y-1 text-xs">
                    {visible.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(event);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-gray-700 transition hover:bg-gray-100"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        <span className="line-clamp-1 font-medium">
                          {event.title}
                        </span>
                      </button>
                    ))}
                    {hiddenCount > 0 && (
                      <button
                        type="button"
                        onClick={() => onDrillDown(day)}
                        className="text-[11px] font-medium text-blue-600"
                      >
                        +{hiddenCount} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
