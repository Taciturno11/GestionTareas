import { PageType } from '@prisma/client'
import { prisma } from '../../database/prisma.js'
import type { CreatePageDto, PageTypeDto, UpdatePageDto } from './pages.dto.js'

function toPrismaPageType(type: PageTypeDto) {
  const map: Record<PageTypeDto, PageType> = {
    blank: PageType.BLANK,
    text: PageType.TEXT,
    board: PageType.BOARD,
    database: PageType.DATABASE,
    tasks: PageType.TASKS,
  }
  return map[type]
}

export function findMany(workspaceId: string, spaceId?: string) {
  return prisma.page.findMany({
    where: { workspaceId, ...(spaceId ? { spaceId } : {}) },
    orderBy: { updatedAt: 'desc' },
  })
}

export function findById(id: string) {
  return prisma.page.findUnique({ where: { id } })
}

export function create(data: CreatePageDto) {
  return prisma.page.create({
    data: {
      id: data.id,
      workspaceId: data.workspaceId,
      spaceId: data.spaceId,
      title: data.title,
      type: toPrismaPageType(data.type),
      content: data.content,
    },
  })
}

export function update(id: string, data: UpdatePageDto) {
  return prisma.page.update({
    where: { id },
    data: {
      ...data,
      type: data.type ? toPrismaPageType(data.type) : undefined,
    },
  })
}

export function remove(id: string) {
  return prisma.page.delete({ where: { id } })
}
