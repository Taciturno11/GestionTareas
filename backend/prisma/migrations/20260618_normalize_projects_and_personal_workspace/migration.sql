-- Add the explicit personal workspace pointer. It remains nullable for historical
-- and orphaned records; all newly provisioned users receive a value.
ALTER TABLE "User" ADD COLUMN "personalWorkspaceId" TEXT;

CREATE UNIQUE INDEX "User_personalWorkspaceId_key"
ON "User"("personalWorkspaceId");

ALTER TABLE "User"
ADD CONSTRAINT "User_personalWorkspaceId_fkey"
FOREIGN KEY ("personalWorkspaceId") REFERENCES "Workspace"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Normalize projects previously stored in TaskSettings.projects.
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6472EB',
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Project_workspaceId_name_key"
ON "Project"("workspaceId", "name");

CREATE UNIQUE INDEX "Project_id_workspaceId_key"
ON "Project"("id", "workspaceId");

CREATE INDEX "Project_workspaceId_archivedAt_idx"
ON "Project"("workspaceId", "archivedAt");

ALTER TABLE "Project"
ADD CONSTRAINT "Project_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- IDs are deterministic so the migration is reproducible and old project IDs
-- can be mapped without relying on database extensions.
INSERT INTO "Project" ("id", "workspaceId", "name", "color")
SELECT
  'prj_' || md5(settings."workspaceId" || ':' || (project.value->>'id')),
  settings."workspaceId",
  COALESCE(NULLIF(project.value->>'label', ''), project.value->>'id'),
  COALESCE(NULLIF(project.value->>'color', ''), '#6472EB')
FROM "TaskSettings" settings
CROSS JOIN LATERAL jsonb_array_elements(settings."projects") AS project(value)
WHERE NULLIF(project.value->>'id', '') IS NOT NULL
ON CONFLICT ("workspaceId", "name") DO NOTHING;

UPDATE "Task" task
SET "projectId" = project."id"
FROM "Project" project
WHERE task."workspaceId" = project."workspaceId"
  AND project."id" = 'prj_' || md5(task."workspaceId" || ':' || task."projectId");

-- Preserve every task but clear invalid historical project references.
UPDATE "Task" task
SET "projectId" = NULL
WHERE task."projectId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "Project" project
    WHERE project."id" = task."projectId"
      AND project."workspaceId" = task."workspaceId"
  );

CREATE INDEX "Task_projectId_workspaceId_idx"
ON "Task"("projectId", "workspaceId");

ALTER TABLE "Task"
ADD CONSTRAINT "Task_projectId_workspaceId_fkey"
FOREIGN KEY ("projectId", "workspaceId")
REFERENCES "Project"("id", "workspaceId")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Select one existing OWNER workspace as the initial personal workspace.
-- The dedicated consolidation script can replace this choice for Martin.
UPDATE "User" user_record
SET "personalWorkspaceId" = owner_workspace."workspaceId"
FROM (
  SELECT DISTINCT ON ("userId") "userId", "workspaceId"
  FROM "WorkspaceMember"
  WHERE "role" = 'OWNER'
  ORDER BY "userId", "createdAt" ASC
) owner_workspace
WHERE user_record."id" = owner_workspace."userId"
  AND user_record."personalWorkspaceId" IS NULL;
