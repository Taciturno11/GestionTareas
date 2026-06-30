-- Add soft-archive support for tasks.
ALTER TABLE "Task" ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "Task_workspaceId_archivedAt_idx" ON "Task"("workspaceId", "archivedAt");
