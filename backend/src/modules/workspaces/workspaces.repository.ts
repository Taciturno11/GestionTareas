import { WorkspaceRole } from '@prisma/client'
import { prisma } from '../../database/prisma.js'
import type { CreateWorkspaceDto, UpdateWorkspaceDto } from './workspaces.dto.js'

export function findManyForUser(userId: string) {
  return prisma.workspace.findMany({
    where: { members: { some: { userId } } },
    orderBy: { updatedAt: 'desc' },
    include: { members: true },
  })
}

export function findManyAll() {
  return prisma.workspace.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { members: true },
  })
}

export function findById(id: string) {
  return prisma.workspace.findUnique({ where: { id } })
}

export function createForOwner(ownerId: string, data: CreateWorkspaceDto) {
  return prisma.workspace.create({
    data: {
      id: data.id,
      name: data.name,
      color: data.color,
      members: {
        create: {
          userId: ownerId,
          role: WorkspaceRole.OWNER,
        },
      },
      spaces: {
        create: {
          name: 'General',
          icon: 'folder',
          iconColor: data.color,
        },
      },
    },
  })
}

export function update(id: string, data: UpdateWorkspaceDto) {
  return prisma.workspace.update({ where: { id }, data })
}

export function remove(id: string) {
  return prisma.workspace.delete({ where: { id } })
}
