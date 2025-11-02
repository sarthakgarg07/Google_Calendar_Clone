-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "color" TEXT NOT NULL DEFAULT '#4989ff',
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "start" DATETIME NOT NULL,
    "end" DATETIME NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "events_start_idx" ON "events"("start");

-- CreateIndex
CREATE INDEX "events_end_idx" ON "events"("end");
