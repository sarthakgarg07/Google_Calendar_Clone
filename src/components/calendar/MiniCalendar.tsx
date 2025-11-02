import {
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
} from "date-fns";

import { getMonthMatrix } from "@/lib/calendar";

interface MiniCalendarProps {
  monthAnchor: Date;
  selectedDate: Date;
  onChangeMonth: (date: Date) => void;
  onSelect: (date: Date) => void;
}

export function MiniCalendar({
  monthAnchor,
  selectedDate,
  onChangeMonth,
  onSelect,
}: MiniCalendarProps) {
  const monthMatrix = getMonthMatrix(monthAnchor);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <button
          type="button"
          onClick={() => onChangeMonth(addMonths(monthAnchor, -1))}
          className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="text-sm font-semibold text-gray-800">
          {format(monthAnchor, "MMMM yyyy")}
        </p>
        <button
          type="button"
          onClick={() => onChangeMonth(addMonths(monthAnchor, 1))}
          className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 px-4 pb-4 text-center text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 px-4 pb-4">
        {monthMatrix.flat().map((day) => {
          const isCurrentMonth = isSameMonth(day, startOfMonth(monthAnchor));
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelect(day)}
              className={`relative flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${
                isSelected
                  ? "bg-blue-600 font-medium text-white shadow"
                  : isToday
                  ? "border border-blue-500 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              } ${!isCurrentMonth ? "text-gray-300" : ""}`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
