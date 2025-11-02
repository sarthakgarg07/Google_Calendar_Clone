"use client";

import { useCallback, useMemo } from "react";
import {
  addMinutes,
  endOfDay,
  format,
  isToday,
  max as maxDate,
  min as minDate,
  startOfDay,
} from "date-fns";

import { getWeekDays } from "@/lib/calendar";
import type { CalendarEvent } from "@/types/events";

const MINUTES_IN_DAY = 24 * 60;
const HOUR_HEIGHT = 64; // px
const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;
const HOURS = Array.from({ length: 24 }, (_, index) => index);

interface WeekViewProps {
  anchor: Date;
  events: CalendarEvent[];
  onCreate: (start: Date, end?: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

interface DaySegment {
  event: CalendarEvent;
  startMinutes: number;
  endMinutes: number;
  startDate: Date;
  endDate: Date;
}

interface PositionedSegment extends DaySegment {
  column: number;
  columns: number;
}

function clampToDay(event: CalendarEvent, day: Date): DaySegment | null {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);

  if (eventEnd <= dayStart || eventStart >= dayEnd) {
    return null;
  }

  const start = maxDate([eventStart, dayStart]);
  const end = minDate([eventEnd, dayEnd]);

  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();

  return {
    event,
    startMinutes,
    endMinutes,
    startDate: start,
    endDate: end,
  };
}

function layoutSegments(segments: DaySegment[]): PositionedSegment[] {
  const lanes: PositionedSegment[][] = [];
  const positioned: PositionedSegment[] = [];

  const sorted = [...segments].sort(
    (a, b) => a.startMinutes - b.startMinutes
  );

  sorted.forEach((segment) => {
    let laneIndex = lanes.findIndex((lane) => {
      const last = lane[lane.length - 1];
      return last.endMinutes <= segment.startMinutes;
    });

    if (laneIndex === -1) {
      laneIndex = lanes.length;
      lanes.push([]);
    }

    const positionedSegment: PositionedSegment = {
      ...segment,
      column: laneIndex,
      columns: 1,
    };

    lanes[laneIndex].push(positionedSegment);
    positioned.push(positionedSegment);
  });

  const laneCount = lanes.length || 1;
  positioned.forEach((segment) => {
    segment.columns = laneCount;
  });

  return positioned;
}

function splitEventsByDay(events: CalendarEvent[], day: Date) {
  const timed: DaySegment[] = [];
  const allDay: CalendarEvent[] = [];

  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  events.forEach((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    if (event.allDay || eventEnd.getDate() !== eventStart.getDate()) {
      if (eventEnd > dayStart && eventStart < dayEnd) {
        allDay.push(event);
      }
      return;
    }

    const segment = clampToDay(event, day);
    if (segment) {
      timed.push(segment);
    }
  });

  return { timed, allDay };
}

export function WeekView({
  anchor,
  events,
  onCreate,
  onSelectEvent,
}: WeekViewProps) {
  const days = useMemo(() => getWeekDays(anchor), [anchor]);

  const data = useMemo(() => {
    return days.map((day) => {
      const { timed, allDay } = splitEventsByDay(events, day);
      return {
        day,
        timed: layoutSegments(timed),
        allDay,
      };
    });
  }, [days, events]);

  const handleCreate = useCallback(
    (day: Date, clientY: number, rect: DOMRect) => {
      const offset = clientY - rect.top;
      const minutes = Math.max(
        0,
        Math.min(MINUTES_IN_DAY - 30, offset / PIXELS_PER_MINUTE)
      );
      const rounded = Math.round(minutes / 30) * 30;
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      start.setMinutes(rounded);
      const end = addMinutes(new Date(start), 60);
      onCreate(start, end);
    },
    [onCreate]
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="grid grid-cols-[80px_repeat(7,_1fr)] border-b border-gray-100 bg-gray-50 text-sm font-semibold text-gray-500">
        <div className="px-4 py-3" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="flex flex-col items-center gap-1 px-4 py-3"
          >
            <span className="text-[11px] uppercase tracking-wide text-gray-400">
              {format(day, "EEE")}
            </span>
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-base font-medium ${
                isToday(day)
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700"
              }`}
            >
              {format(day, "d")}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[80px_repeat(7,_1fr)]">
        <div className="flex flex-col border-r border-gray-100 bg-white text-right text-xs text-gray-400">
          {HOURS.map((hour) => (
            <div key={hour} className="relative" style={{ height: HOUR_HEIGHT }}>
              <span className="absolute -top-2 right-2">
                {format(new Date(2020, 0, 1, hour), "ha")}
              </span>
            </div>
          ))}
        </div>

        {data.map(({ day, timed, allDay }) => (
          <div
            key={day.toISOString()}
            className="relative border-l border-gray-100"
          >
            <div className="flex min-h-[44px] flex-wrap gap-2 border-b border-gray-100 bg-gray-50/70 px-3 py-2">
              {allDay.length === 0 && (
                <span className="text-xs text-gray-400">No all-day events</span>
              )}
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

            <div
              className="relative"
              style={{ height: HOUR_HEIGHT * 24 }}
              onDoubleClick={(event) => {
                const rect = (
                  event.currentTarget as HTMLDivElement
                ).getBoundingClientRect();
                handleCreate(day, event.clientY, rect);
              }}
            >
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-b border-gray-100"
                  style={{
                    top: hour * HOUR_HEIGHT,
                    height: HOUR_HEIGHT,
                  }}
                />
              ))}

              {timed.map((segment) => {
                const duration = Math.max(
                  segment.endMinutes - segment.startMinutes,
                  30
                );
                const top = segment.startMinutes * PIXELS_PER_MINUTE;
                const height = duration * PIXELS_PER_MINUTE;
                const left = (segment.column / segment.columns) * 100;
                const width = 100 / segment.columns;

                return (
                  <button
                    key={`${segment.event.id}-${segment.startDate.toISOString()}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(segment.event);
                    }}
                    className="absolute flex flex-col overflow-hidden rounded-xl border border-white/60 bg-white/90 p-2 text-left shadow-lg"
                    style={{
                      top,
                      height,
                      left: `calc(${left}% + 2px)`,
                      width: `calc(${width}% - 4px)`,
                      backgroundColor: segment.event.color,
                      color: "white",
                    }}
                  >
                    <span className="text-[11px] font-semibold leading-tight">
                      {format(segment.startDate, "h:mm a")} –{" "}
                      {format(segment.endDate, "h:mm a")}
                    </span>
                    <span className="mt-1 text-sm font-semibold leading-snug">
                      {segment.event.title}
                    </span>
                    {segment.event.location && (
                      <span className="mt-1 text-[11px] opacity-80">
                        {segment.event.location}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
