import { ChevronLeft, ChevronRight, Search, Settings, HelpCircle } from "lucide-react";

import { viewLabel } from "@/lib/calendar";
import type { CalendarView } from "@/types/events";

interface CalendarHeaderProps {
  view: CalendarView;
  anchor: Date;
  onChangeView: (view: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const viewOptions: { value: CalendarView; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export function CalendarHeader({
  view,
  anchor,
  onChangeView,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[#1a73e8] px-6 py-4 text-white shadow-lg shadow-blue-900/30 lg:flex-nowrap">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-2xl bg-white text-[#1a73e8] shadow">
          <span className="text-xs font-semibold uppercase tracking-wide">
            {new Date().toLocaleString("en-US", { month: "short" })}
          </span>
          <span className="text-xl font-bold leading-none">
            {new Date().getDate()}
          </span>
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Calendar
          </h1>
          <p className="text-sm text-blue-100">
            A near pixel-perfect Google Calendar clone
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center gap-2 lg:justify-start">
        <button
          type="button"
          onClick={onToday}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1a73e8] shadow transition hover:bg-blue-50"
        >
          Today
        </button>
        <div className="flex items-center rounded-full bg-white/20 px-3 py-1.5">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous period"
            className="rounded-full p-1 hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next period"
            className="rounded-full p-1 hover:bg-white/20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <p className="hidden text-sm font-semibold lg:block">{viewLabel(anchor, view)}</p>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="hidden flex-1 items-center rounded-full bg-white/15 px-3 py-2 text-sm backdrop-blur-sm transition hover:bg-white/20 lg:flex">
          <Search className="mr-2 h-4 w-4 opacity-70" />
          <input
            className="w-full bg-transparent text-sm placeholder:text-blue-100 focus:outline-none"
            placeholder="Search your events"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full p-2 hover:bg-white/20"
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-full p-2 hover:bg-white/20"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
        <div className="hidden items-center rounded-full bg-white/20 p-1 lg:flex">
          {viewOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChangeView(option.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                view === option.value
                  ? "bg-white text-[#1a73e8]"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
