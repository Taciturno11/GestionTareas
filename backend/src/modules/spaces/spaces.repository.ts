import { prisma } from '../../database/prisma.js'
import type { CreateSpaceDto, UpdateSpaceDto } from './spaces.dto.js'

export function findMany(workspaceId: string) {
  return prisma.space.findMany({
    where: { workspaceId },
    orderBy: [{ parentId: 'asc' }, { createdAt: 'asc' }],
  })
}

export function findById(id: string) {
  return prisma.space.findUnique({ where: { id } })
}

export function create(data: CreateSpaceDto) {
  return prisma.space.create({
    data: {
      id: data.id,
      workspaceId: data.workspaceId,
      parentId: data.parentId ?? null,
      name: data.name,
      icon: data.icon,
      iconColor: data.iconColor,
      description: data.description ?? '',
      archived: Boolean(data.archived),
      archivedAt: data.archivedAt ? new Date(data.archivedAt) : null,
      collapsed: Boolean(data.collapsed),
    },
  })
}

export function update(id: string, data: UpdateSpaceDto) {
  return prisma.space.update({
    where: { id },
    data: { ...data, parentId: data.parentId ?? undefined },
  })
}

export function archive(id: string) {
  return prisma.space.update({
    where: { id },
    data: { archived: true, archivedAt: new Date() },
  })
}

export function restore(id: string) {
  return prisma.space.update({
    where: { id },
    data: { archived: false, archivedAt: null },
  })
}

export function remove(id: string) {
  return prisma.space.delete({ where: { id } })
}
