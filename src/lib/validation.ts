import { z } from "zod";

const isoDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid ISO date value",
  })
  .transform((value) => new Date(value));

export const eventInputSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(120),
    description: z.string().optional(),
    location: z.string().optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color").optional(),
    allDay: z.boolean().optional(),
    start: isoDate,
    end: isoDate,
    timeZone: z.string().optional(),
  })
  .refine((data) => data.end > data.start, {
    message: "End time must be after start time",
    path: ["end"],
  });

export const eventUpdateSchema = eventInputSchema.partial().extend({
  title: z.string().min(1).max(120).optional(),
});

export type EventInput = z.infer<typeof eventInputSchema>;
