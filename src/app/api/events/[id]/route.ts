import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { eventUpdateSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const json = await request.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const result = eventUpdateSchema.safeParse(json);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const payload = result.data;
    const nextStart = payload.start ?? existing.start;
    const nextEnd = payload.end ?? existing.end;
    const nextAllDay =
      payload.allDay !== undefined ? payload.allDay : existing.allDay;

    if (nextEnd <= nextStart) {
      return NextResponse.json(
        {
          error: {
            formErrors: ["End time must be after start time"],
            fieldErrors: {},
          },
        },
        { status: 400 }
      );
    }

    const overlap = await prisma.event.findFirst({
      where: {
        id: { not: id },
        AND: [
          { start: { lt: nextEnd } },
          { end: { gt: nextStart } },
        ],
      },
    });

    if (overlap && !nextAllDay) {
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

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...payload,
        start: nextStart,
        end: nextEnd,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Failed to update event", error);
    return NextResponse.json(
      { error: "Unable to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete event", error);
    return NextResponse.json(
      { error: "Unable to delete event" },
      { status: 500 }
    );
  }
}
