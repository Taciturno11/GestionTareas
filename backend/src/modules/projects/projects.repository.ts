import { prisma } from '../../database/prisma.js'
import type { CreateProjectDto, UpdateProjectDto } from './projects.dto.js'

export function findMany(workspaceId: string, includeArchived: boolean) {
  return prisma.project.findMany({
    where: {
      workspaceId,
      ...(includeArchived ? {} : { archivedAt: null }),
    },
    orderBy: [{ archivedAt: 'asc' }, { name: 'asc' }],
  })
}

export function findById(id: string) {
  return prisma.project.findUnique({ where: { id } })
}

export function findByWorkspaceAndName(workspaceId: string, name: string) {
  return prisma.project.findFirst({
    where: {
      workspaceId,
      name: { equals: name, mode: 'insensitive' },
    },
    select: { id: true },
  })
}

export function create(data: CreateProjectDto) {
  return prisma.project.create({ data })
}

export function update(id: string, data: UpdateProjectDto) {
  return prisma.project.update({ where: { id }, data })
}

export function archive(id: string) {
  return prisma.project.update({
    where: { id },
    data: { archivedAt: new Date() },
  })
}

export function restore(id: string) {
  return prisma.project.update({
    where: { id },
    data: { archivedAt: null },
  })
}
