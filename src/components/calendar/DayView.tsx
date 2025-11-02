"use client";

import {
  addMinutes,
  endOfDay,
  format,
  max as maxDate,
  min as minDate,
  startOfDay,
} from "date-fns";
import { useCallback, useMemo } from "react";

import type { CalendarEvent } from "@/types/events";

const MINUTES_IN_DAY = 24 * 60;
const HOUR_HEIGHT = 72;
const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;
const HOURS = Array.from({ length: 24 }, (_, index) => index);

interface DayViewProps {
  anchor: Date;
  events: CalendarEvent[];
  onCreate: (start: Date, end?: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

interface Segment {
  event: CalendarEvent;
  startMinutes: number;
  endMinutes: number;
  startDate: Date;
  endDate: Date;
}

function clampToDay(event: CalendarEvent, day: Date): Segment | null {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);

  if (eventEnd <= dayStart || eventStart >= dayEnd) {
    return null;
  }

  const start = maxDate([eventStart, dayStart]);
  const end = minDate([eventEnd, dayEnd]);

  return {
    event,
    startMinutes: start.getHours() * 60 + start.getMinutes(),
    endMinutes: end.getHours() * 60 + end.getMinutes(),
    startDate: start,
    endDate: end,
  };
}

export function DayView({ anchor, events, onCreate, onSelectEvent }: DayViewProps) {
  const { allDay, timed } = useMemo(() => {
    const dayStart = startOfDay(anchor);
    const dayEnd = endOfDay(anchor);

    const allDayEvents: CalendarEvent[] = [];
    const timedSegments: Segment[] = [];

    events.forEach((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      if (event.allDay || eventEnd > dayEnd || eventStart < dayStart) {
        if (eventEnd > dayStart && eventStart < dayEnd) {
          allDayEvents.push(event);
        }
        return;
      }

      const segment = clampToDay(event, anchor);
      if (segment) {
        timedSegments.push(segment);
      }
    });

    return {
      allDay: allDayEvents,
      timed: timedSegments.sort((a, b) => a.startMinutes - b.startMinutes),
    };
  }, [anchor, events]);

  const handleCreate = useCallback(
    (clientY: number, rect: DOMRect) => {
      const offset = clientY - rect.top;
      const minutes = Math.max(
        0,
        Math.min(MINUTES_IN_DAY - 30, offset / PIXELS_PER_MINUTE)
      );
      const rounded = Math.round(minutes / 30) * 30;
      const start = new Date(anchor);
      start.setHours(0, 0, 0, 0);
      start.setMinutes(rounded);
      const end = addMinutes(new Date(start), 60);
      onCreate(start, end);
    },
    [anchor, onCreate]
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{format(anchor, "EEEE")}</p>
          <p className="text-2xl font-semibold text-gray-900">{format(anchor, "MMMM d, yyyy")}</p>
        </div>
        <div className="rounded-full bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-600">
          {format(anchor, "MMM d")}
        </div>
      </div>

      <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-3">
        {allDay.length === 0 ? (
          <p className="text-xs text-gray-400">No all-day events</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allDay.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event)}
                className="rounded-full px-3 py-1 text-xs font-semibold text-white shadow"
                style={{ backgroundColor: event.color }}
              >
                {event.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-[80px_1fr]">
          <div className="flex flex-col border-r border-gray-100 bg-white text-right text-xs text-gray-400">
            {HOURS.map((hour) => (
              <div key={hour} className="relative" style={{ height: HOUR_HEIGHT }}>
                <span className="absolute -top-2 right-3">
                  {format(new Date(2020, 0, 1, hour), "ha")}
                </span>
              </div>
            ))}
          </div>

          <div
            className="relative pr-2"
            style={{ height: HOUR_HEIGHT * 24 }}
            onDoubleClick={(event) => {
              const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
              handleCreate(event.clientY, rect);
            }}
          >
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-b border-gray-100"
                style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
              />
            ))}

            {timed.map((segment) => {
              const duration = Math.max(segment.endMinutes - segment.startMinutes, 30);
              const top = segment.startMinutes * PIXELS_PER_MINUTE;
              const height = duration * PIXELS_PER_MINUTE;

              return (
                <button
                  key={`${segment.event.id}-${segment.startDate.toISOString()}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEvent(segment.event);
                  }}
                  className="absolute flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/90 p-3 text-left shadow-lg"
                  style={{
                    top,
                    height,
                    left: "8px",
                    right: "8px",
                    backgroundColor: segment.event.color,
                    color: "white",
                  }}
                >
                  <span className="text-xs font-semibold">
                    {format(segment.startDate, "h:mm a")} – {format(segment.endDate, "h:mm a")}
                  </span>
                  <span className="text-base font-semibold leading-snug">
                    {segment.event.title}
                  </span>
                  {segment.event.description && (
                    <span className="mt-1 text-xs opacity-80">{segment.event.description}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
