import { prisma } from '../../database/prisma.js'
import type { CreateSpaceShareDto, UpdateSpaceShareDto } from './shared-spaces.dto.js'

export function findSpaceById(id: string) {
  return prisma.space.findUnique({ where: { id } })
}

export function findManyForSpace(spaceId: string) {
  return prisma.spaceShare.findMany({
    where: { spaceId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  })
}

export function findById(id: string) {
  return prisma.spaceShare.findUnique({
    where: { id },
    include: { space: true },
  })
}

export function findBySpaceAndUser(spaceId: string, userId: string) {
  return prisma.spaceShare.findUnique({
    where: { spaceId_userId: { spaceId, userId } },
  })
}

export function create(spaceId: string, createdById: string, data: CreateSpaceShareDto) {
  return prisma.spaceShare.create({
    data: {
      spaceId,
      userId: data.userId,
      role: data.role,
      createdById,
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  })
}

export function update(id: string, data: UpdateSpaceShareDto) {
  return prisma.spaceShare.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  })
}

export function remove(id: string) {
  return prisma.spaceShare.delete({ where: { id } })
}

export function findReceivedShares(userId: string) {
  return prisma.spaceShare.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    include: {
      space: { include: { workspace: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  })
}

export function findWorkspaceSpaces(workspaceId: string) {
  return prisma.space.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'asc' },
  })
}

export function findWorkspacePageSummaries(workspaceId: string) {
  return prisma.page.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      workspaceId: true,
      spaceId: true,
      title: true,
      type: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export function findWorkspaceMember(userId: string, workspaceId: string) {
  return prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  })
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id }, select: { id: true } })
}

