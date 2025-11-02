"use client";

import { useCallback, useMemo, useState } from "react";
import { addHours, startOfMonth } from "date-fns";

import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { DayView } from "@/components/calendar/DayView";
import { EventModal } from "@/components/calendar/EventModal";
import { MonthView } from "@/components/calendar/MonthView";
import { Sidebar } from "@/components/calendar/Sidebar";
import { WeekView } from "@/components/calendar/WeekView";
import { useEvents } from "@/hooks/use-events";
import { calendarColors } from "@/lib/palette";
import {
  endOfView,
  nextDate,
  previousDate,
  startOfView,
} from "@/lib/calendar";
import { createEvent, deleteEvent, updateEvent } from "@/lib/api";
import type { EventInput } from "@/lib/validation";
import type { CalendarEvent, CalendarView } from "@/types/events";

function findInitialColor(events: CalendarEvent[]) {
  return events[0]?.color ?? calendarColors[0];
}

export function CalendarShell() {
  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [sidebarMonth, setSidebarMonth] = useState(() => startOfMonth(new Date()));
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [modalAnchor, setModalAnchor] = useState(() => new Date());
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const rangeStart = useMemo(() => startOfView(anchor, view), [anchor, view]);
  const rangeEnd = useMemo(() => endOfView(anchor, view), [anchor, view]);

  const { events, isLoading, mutate, error } = useEvents(rangeStart, rangeEnd);

  const activeColor = editingEvent?.color ?? findInitialColor(events);

  const setActiveAnchor = useCallback((date: Date) => {
    setAnchor(date);
    setSidebarMonth(startOfMonth(date));
  }, []);

  const openCreateModal = useCallback((start: Date) => {
    setModalMode("create");
    setEditingEvent(null);
    setModalAnchor(start);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((event: CalendarEvent) => {
    setModalMode("edit");
    setEditingEvent(event);
    setModalAnchor(new Date(event.start));
    setModalOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (payload: EventInput) => {
      if (modalMode === "create") {
        await createEvent(payload);
      } else if (editingEvent) {
        await updateEvent(editingEvent.id, payload);
      }
      await mutate();
    },
    [modalMode, editingEvent, mutate]
  );

  const handleDelete = useCallback(async () => {
    if (!editingEvent) return;
    await deleteEvent(editingEvent.id);
    await mutate();
  }, [editingEvent, mutate]);

  const handleDrillDown = useCallback(
    (date: Date) => {
      setActiveAnchor(date);
      setView("day");
    },
    [setActiveAnchor]
  );

  const handleCreateFromSidebar = useCallback(() => {
    const start = addHours(new Date(anchor), 10);
    openCreateModal(start);
  }, [anchor, openCreateModal]);

  const onCreateFromMonth = useCallback(
    (date: Date) => {
      const start = addHours(date, 10);
      openCreateModal(start);
    },
    [openCreateModal]
  );

  const onCreateTimed = useCallback(
    (start: Date) => {
      openCreateModal(start);
    },
    [openCreateModal]
  );

  return (
    <div className="flex flex-col gap-6 py-6">
      <CalendarHeader
        view={view}
        anchor={anchor}
        onChangeView={(next) => setView(next)}
        onPrev={() => setActiveAnchor(previousDate(anchor, view))}
        onNext={() => setActiveAnchor(nextDate(anchor, view))}
        onToday={() => {
          const today = new Date();
          setActiveAnchor(today);
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Sidebar
          monthAnchor={sidebarMonth}
          selectedDate={anchor}
          events={events}
          onCreate={handleCreateFromSidebar}
          onSelectDate={(date) => {
            setActiveAnchor(date);
            setView("day");
          }}
          onChangeMonth={(date) => setSidebarMonth(startOfMonth(date))}
          onSelectEvent={openEditModal}
        />

        <div className="space-y-3">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              Unable to load events. Please refresh.
            </div>
          )}

          {view === "month" && (
            <MonthView
              anchor={anchor}
              events={events}
              onCreate={onCreateFromMonth}
              onSelectEvent={openEditModal}
              onDrillDown={handleDrillDown}
            />
          )}

          {view === "week" && (
            <WeekView
              anchor={anchor}
              events={events}
              onCreate={onCreateTimed}
              onSelectEvent={openEditModal}
            />
          )}

          {view === "day" && (
            <DayView
              anchor={anchor}
              events={events}
              onCreate={onCreateTimed}
              onSelectEvent={openEditModal}
            />
          )}

          {isLoading && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-600">
              Syncing your calendar…
            </div>
          )}
        </div>
      </div>

      <EventModal
        open={modalOpen}
        mode={modalMode}
        event={editingEvent ?? undefined}
        anchor={modalAnchor}
        activeColor={activeColor}
        onSubmit={handleSubmit}
        onDelete={modalMode === "edit" ? handleDelete : undefined}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
