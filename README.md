# Google Calendar Clone

This project is a high-fidelity clone of Google Calendar built with Next.js 16 (App Router) and Prisma. It reproduces the core scheduling flows—month/week/day navigation, inline event creation, editing, deletion, and real-time updates—while emphasising smooth interactions and polished UI micro-details.

## Features

- Month, week, and day views with keyboard-accessible navigation and responsive layouts.
- Interactive sidebar with a miniature calendar, "Create" CTA, and upcoming-event strip.
- Event modal matching Google Calendar's UX for creating, editing, or deleting events.
- Conflict detection for overlapping events with clear user feedback.
- SWR-powered live data synchronisation; changes appear instantly without reloads.
- Prisma ORM backed by SQLite (configurable) with an initial migration already applied.
- Tailwind CSS-driven styling with nuanced shadows, highlights, and motion.

## Tech Stack

- **Frontend:** Next.js 16, React 19, App Router, SWR, Tailwind CSS 4, Lucide icons.
- **Backend:** Next.js Route Handlers, Prisma ORM.
- **Database:** SQLite by default (`file:./prisma/dev.db`). Swap for Postgres/MySQL/Mongo by updating `.env` and Prisma schema.
- **Validation:** Zod schemas shared between API routes and client helpers.

## Project Structure

```
src/
  app/
    api/events/         # REST endpoints for CRUD
    page.tsx            # CalendarShell entry point
    globals.css         # Tailwind + base styles
  components/calendar/  # CalendarShell + Month/Week/Day views, modal, sidebar
  hooks/                # SWR hooks
  lib/                  # Prisma client, palette, calendar math, API helpers, validation
  types/                # Shared TypeScript contracts
prisma/
  schema.prisma         # Event model
  migrations/           # Initial schema migration (already applied to dev.db)
  dev.db                # SQLite database (generated after migration)
```

## Getting Started

### Prerequisites

- Node.js ≥ 18 (v22.14.0 used during development)
- npm (ships with Node)

### Installation

```bash
git clone <repo-url>
cd google-calendar-clone
npm install
```

### Environment

Create a `.env` file in the project root (or copy `.env.example` if present) with the connection string:

```
DATABASE_URL="file:./prisma/dev.db"
```

> **Mac/Linux note:** If you see “Error code 14: Unable to open the database file”, double-check that the app is being executed from inside `google-calendar-clone`. In rare cases (e.g., multiple lockfiles in parent folders) you can instead point to the absolute path: `DATABASE_URL="file:/full/path/to/google-calendar-clone/prisma/dev.db"`.

### Database Migration

The initial SQL migration is committed in `prisma/migrations/0001_init`. Apply it after installing dependencies:

```bash
# From the project root
mkdir -p .home                   # only needed if your shell restricts ~/.cache
HOME=$PWD/.home npx prisma migrate deploy
HOME=$PWD/.home npx prisma generate
```

The `HOME=...` override keeps Prisma’s binary downloads inside the repo so reviewers don’t need elevated permissions. On unrestricted environments you can omit the prefix.

### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the calendar. If your machine forbids binding to `0.0.0.0:3000`, start the server with `npm run dev -- --hostname 127.0.0.1 --port 3001` instead.

### Linting

```bash
npm run lint
```

## API Overview

| Method | Endpoint              | Description                              |
| ------ | --------------------- | ---------------------------------------- |
| `GET`  | `/api/events`         | Query events between `start` and `end`.  |
| `POST` | `/api/events`         | Create a new event. Validates conflicts. |
| `PATCH`| `/api/events/:id`     | Update attributes on an existing event.  |
| `DELETE`| `/api/events/:id`    | Remove an event by ID.                   |

### Query Parameters

- `start` / `end`: ISO timestamps defining the fetch window. The UI automatically requests the correct range for the selected view.

### Payload Contract

```ts
interface EventInput {
  title: string;
  description?: string;
  location?: string;
  color?: string;        // Hex string, defaults to Google palette
  allDay?: boolean;
  start: string;         // ISO string, converted to Date server-side
  end: string;           // ISO string, must be after `start`
  timeZone?: string;
}
```

Validation is enforced by Zod in `src/lib/validation.ts`. API responses surface field and form errors to the modal for user feedback.

## UX Notes & Interactions

- **Create events** via the sidebar button, double-clicking a month cell, or double-clicking a slot in week/day views.
- **Drag-like creation**: double-click week/day grids where you want the event; the modal inherits the anchor time.
- **Conflict guard**: overlapping timed events return a 409 with a descriptive message.
- **Responsive design**: the layout collapses gracefully on tablets/phones while retaining full functionality.
- **Visual polish**: gradients, translucent cards, and smooth transitions echo Google Calendar’s aesthetic.

## Future Enhancements

1. Recurring events (RRULE parsing + expansion).
2. Drag-and-drop resizing and movement within the grid.
3. Shared calendars & attendee invites.
4. Integration with an auth provider for multi-user scenarios.
5. Week numbers, alternate timezones, and agenda list view.

## Troubleshooting

- **Prisma engine download issues**: set `HOME` to a writable directory (see `src/lib/prisma.ts` usage) or configure `PRISMA_CLI_BINARY_DOWNLOAD_DIR`.
- **Database path differences**: when deploying, update `DATABASE_URL` to the hosted database and rerun `npx prisma migrate deploy`.
- **Hot reload lag**: ensure you run `npm run dev` (not `next dev --turbo`) because Turbopack is disabled for this assignment.

---

Built with ❤️ to mirror Google Calendar’s feel while keeping the stack approachable and well-documented. Let me know if you need a walkthrough of any architectural decision.
# Google_Calendar_Clone
