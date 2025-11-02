"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { format, addHours, addMinutes, parseISO } from "date-fns";
import { X, Trash2 } from "lucide-react";

import { calendarColors } from "@/lib/palette";
import type { EventInput } from "@/lib/validation";
import type { CalendarEvent } from "@/types/events";

const DATE_FORMAT = "yyyy-MM-dd";
const TIME_FORMAT = "HH:mm";

type Mode = "create" | "edit";

export interface EventDraft {
  title: string;
  description: string;
  location: string;
  color: string;
  allDay: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

function getDefaultDraft(anchor: Date, color: string): EventDraft {
  const start = new Date(anchor);
  const end = addHours(start, 1);

  return {
    title: "",
    description: "",
    location: "",
    color,
    allDay: false,
    startDate: format(start, DATE_FORMAT),
    startTime: format(start, TIME_FORMAT),
    endDate: format(end, DATE_FORMAT),
    endTime: format(end, TIME_FORMAT),
  };
}

function buildDraftFromEvent(event: CalendarEvent): EventDraft {
  const start = parseISO(event.start);
  const rawEnd = parseISO(event.end);
  const end = event.allDay ? addMinutes(rawEnd, -1) : rawEnd;
  return {
    title: event.title,
    description: event.description ?? "",
    location: event.location ?? "",
    color: event.color,
    allDay: event.allDay,
    startDate: format(start, DATE_FORMAT),
    startTime: format(start, TIME_FORMAT),
    endDate: format(end, DATE_FORMAT),
    endTime: format(end, TIME_FORMAT),
  };
}

function resolveDate(date: string, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(`${date}T00:00:00`);
  result.setHours(hours);
  result.setMinutes(minutes);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
}

interface EventModalProps {
  open: boolean;
  mode: Mode;
  anchor: Date;
  activeColor: string;
  event?: CalendarEvent | null;
  onSubmit: (payload: EventInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}

export function EventModal({
  open,
  mode,
  event,
  anchor,
  activeColor,
  onSubmit,
  onDelete,
  onClose,
}: EventModalProps) {
  const [draft, setDraft] = useState<EventDraft>(() =>
    event
      ? buildDraftFromEvent(event)
      : getDefaultDraft(anchor, activeColor)
  );
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (event) {
        setDraft(buildDraftFromEvent(event));
        setAllDay(event.allDay);
      } else {
        setDraft(getDefaultDraft(anchor, activeColor));
        setAllDay(false);
      }
      setError(null);
      setPending(false);
    }
  }, [open, event, anchor, activeColor]);

  const title = mode === "create" ? "Create event" : "Edit event";

  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;

    const start = resolveDate(draft.startDate, allDay ? "00:00" : draft.startTime);
    const end = resolveDate(draft.endDate, allDay ? "23:59" : draft.endTime);

    if (end <= start) {
      setError("End time must be after the start time");
      return;
    }

    setPending(true);
    setError(null);

    try {
      await onSubmit({
        title: draft.title.trim(),
        description: draft.description.trim() || undefined,
        location: draft.location.trim() || undefined,
        color: draft.color,
        allDay,
        start,
        end,
        timeZone: timezone,
      });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to save event";
      setError(message);
      setPending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-10 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Title
                </label>
                <input
                  autoFocus
                  name="title"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 [color-scheme:light]"
                  placeholder="Event name"
                />
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">
                    All-day event
                  </p>
                  <button
                    type="button"
                    onClick={() => setAllDay((prev) => !prev)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      allDay ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                        allDay ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Month view events are treated as all-day by default.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-600">
                  Starts
                </label>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <input
                    type="date"
                    required
                    value={draft.startDate}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 [color-scheme:light]"
                  />
                  {!allDay && (
                    <input
                      type="time"
                      required
                      value={draft.startTime}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 [color-scheme:light]"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-600">
                  Ends
                </label>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <input
                    type="date"
                    required
                    value={draft.endDate}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 [color-scheme:light]"
                  />
                  {!allDay && (
                    <input
                      type="time"
                      required
                      value={draft.endTime}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 [color-scheme:light]"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Location
                </label>
                <input
                  name="location"
                  value={draft.location}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="Add location"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Description
                </label>
                <textarea
                  rows={5}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="Add details, links, or attachments"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Event color</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {calendarColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          color,
                        }))
                      }
                      className={`relative h-8 w-8 rounded-full border-2 transition ${
                        draft.color === color
                          ? "border-gray-900 ring-2 ring-offset-2 ring-offset-white"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                <p>
                  Calendar timezone:{" "}
                  <span className="font-medium">{timezone}</span>
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-6 mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            {mode === "edit" && onDelete && (
              <button
                type="button"
                onClick={async () => {
                  if (pending) return;
                  setPending(true);
                  setError(null);
                  try {
                    await onDelete();
                    onClose();
                  } catch (err) {
                    const message =
                      err instanceof Error
                        ? err.message
                        : "Unable to delete event";
                    setError(message);
                    setPending(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {pending ? "Saving…" : mode === "create" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
