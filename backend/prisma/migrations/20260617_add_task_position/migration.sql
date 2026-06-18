-- AlterTable
ALTER TABLE "Task" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Task_workspaceId_status_position_idx"
ON "Task"("workspaceId", "status", "position");
