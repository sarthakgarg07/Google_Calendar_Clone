import { CalendarShell } from "@/components/calendar/CalendarShell";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-100 via-white to-sky-100 px-4 pb-16 pt-10 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <CalendarShell />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(26,115,232,0.14),_transparent_55%)]" />
    </main>
  );
}
