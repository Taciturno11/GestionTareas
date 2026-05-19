import { prisma } from '../../database/prisma.js'
import type { CreateTaskDto, UpdateTaskDto } from './tasks.dto.js'

function toDate(value: string | null | undefined) {
  return value ? new Date(value) : null
}

export function findMany(workspaceId: string, pageId?: string) {
  return prisma.task.findMany({
    where: { workspaceId, ...(pageId ? { pageId } : {}) },
    orderBy: { updatedAt: 'desc' },
  })
}

export function findById(id: string) {
  return prisma.task.findUnique({ where: { id } })
}

export function create(createdById: string, data: CreateTaskDto) {
  return prisma.task.create({
    data: {
      workspaceId: data.workspaceId,
      pageId: data.pageId ?? null,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      tag: data.tag,
      assigneeId: data.assigneeId ?? null,
      startDate: toDate(data.startDate),
      endDate: toDate(data.endDate),
      color: data.color ?? null,
      notes: data.notes,
      createdById,
    },
  })
}

export function update(id: string, data: UpdateTaskDto) {
  return prisma.task.update({
    where: { id },
    data: {
      ...data,
      pageId: data.pageId === undefined ? undefined : data.pageId,
      assigneeId: data.assigneeId === undefined ? undefined : data.assigneeId,
      startDate: data.startDate === undefined ? undefined : toDate(data.startDate),
      endDate: data.endDate === undefined ? undefined : toDate(data.endDate),
      color: data.color === undefined ? undefined : data.color,
    },
  })
}

export function remove(id: string) {
  return prisma.task.delete({ where: { id } })
}
