import type { Prisma } from '@prisma/client'
import { prisma } from '../../database/prisma.js'
import type { UpsertTaskSettingsDto } from './task-settings.dto.js'

export function findByWorkspaceId(workspaceId: string) {
  return prisma.taskSettings.findUnique({ where: { workspaceId } })
}

export function upsert(data: UpsertTaskSettingsDto) {
  const jsonData = {
    projects: data.projects as Prisma.InputJsonValue,
    assignees: data.assignees as Prisma.InputJsonValue,
    labels: data.labels as Prisma.InputJsonValue,
    priorities: data.priorities as Prisma.InputJsonValue,
    statuses: data.statuses as Prisma.InputJsonValue,
  }

  return prisma.taskSettings.upsert({
    where: { workspaceId: data.workspaceId },
    create: { workspaceId: data.workspaceId, ...jsonData },
    update: jsonData,
  })
}
