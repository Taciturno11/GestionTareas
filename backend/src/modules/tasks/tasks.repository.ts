import { prisma } from '../../database/prisma.js'
import type { CreateTaskDto, UpdateTaskDto } from './tasks.dto.js'

function toDate(value: string | null | undefined) {
  return value ? new Date(`${value.slice(0, 10)}T12:00:00.000Z`) : null
}

export function findMany(workspaceId: string, pageId?: string, includeArchived = false) {
  return prisma.task.findMany({
    where: {
      workspaceId,
      ...(pageId ? { pageId } : {}),
      ...(includeArchived ? {} : { archivedAt: null }),
    },
    include: { project: true },
    orderBy: [
      { position: 'asc' },
      { updatedAt: 'desc' },
    ],
  })
}

export function findById(id: string) {
  return prisma.task.findUnique({ where: { id }, include: { project: true } })
}

export function create(createdById: string, data: CreateTaskDto) {
  return prisma.task.create({
    data: {
      id: data.id,
      workspaceId: data.workspaceId,
      pageId: data.pageId ?? null,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      projectId: data.projectId ?? null,
      tag: data.tag,
      assigneeId: data.assigneeId ?? null,
      startDate: toDate(data.startDate),
      endDate: toDate(data.endDate),
      color: data.color ?? null,
      notes: data.notes,
      position: data.position,
      createdById,
    },
    include: { project: true },
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
    include: { project: true },
  })
}

export function remove(id: string) {
  return prisma.task.delete({ where: { id } })
}

export function archive(id: string) {
  return prisma.task.update({
    where: { id },
    data: { archivedAt: new Date() },
    include: { project: true },
  })
}

export function restore(id: string) {
  return prisma.task.update({
    where: { id },
    data: { archivedAt: null },
    include: { project: true },
  })
}
