import { NextResponse } from "next/server";
import { addMinutes } from "date-fns";

import { prisma } from "@/lib/prisma";
import { calendarColors } from "@/lib/palette";
import { eventInputSchema } from "@/lib/validation";

function parseRange(searchParams: URLSearchParams) {
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  if (!startParam || !endParam) {
    return null;
  }

  const start = new Date(startParam);
  const end = new Date(endParam);

  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
    return null;
  }

  return { start, end };
}

export async function GET(request: Request) {
  const range = parseRange(new URL(request.url).searchParams);

  if (!range) {
    return NextResponse.json(
      { error: "Invalid or missing `start` and `end` query params" },
      { status: 400 }
    );
  }

  try {
    const events = await prisma.event.findMany({
      where: {
        AND: [
          {
            start: { lt: range.end },
          },
          {
            end: { gt: range.start },
          },
        ],
      },
      orderBy: { start: "asc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to load events", error);
    return NextResponse.json(
      { error: "Unable to load events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);

  if (!json) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const result = eventInputSchema.safeParse(json);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 }
    );
  }

  const payload = result.data;
  const color =
    payload.color ??
    calendarColors[Math.floor(Math.random() * calendarColors.length)] ??
    "#039be5";

  try {
    const overlapping = await prisma.event.findFirst({
      where: {
        AND: [
          {
            start: { lt: payload.end },
          },
          {
            end: { gt: payload.start },
          },
        ],
      },
    });

    if (overlapping && !payload.allDay) {
      return NextResponse.json(
        {
          error: {
            formErrors: ["Event conflicts with an existing entry"],
            fieldErrors: {},
          },
        },
        { status: 409 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title: payload.title,
        description: payload.description,
        location: payload.location,
        color,
        allDay: payload.allDay ?? false,
        start: payload.allDay
          ? payload.start
          : new Date(payload.start),
        end: payload.allDay ? addMinutes(payload.end, 1) : payload.end,
        timeZone:
          payload.timeZone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone ||
          "UTC",
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create event", error);
    return NextResponse.json(
      { error: "Unable to create event" },
      { status: 500 }
    );
  }
}
