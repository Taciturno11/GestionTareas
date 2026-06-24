import { assertPageEdit, assertPageView, assertSpaceEdit, assertWorkspaceMember } from '../../shared/utils/access.js'
import { prisma } from '../../database/prisma.js'
import { HttpError } from '../../shared/utils/http-error.js'
import type { CreatePageDto, UpdatePageDto } from './pages.dto.js'
import * as pagesRepository from './pages.repository.js'

export async function list(userId: string, workspaceId: string, spaceId?: string, includeContent = true) {
  await assertWorkspaceMember(userId, workspaceId)
  return pagesRepository.findMany(workspaceId, spaceId, includeContent)
}

export async function get(userId: string, pageId: string) {
  const page = await pagesRepository.findById(pageId)
  if (!page) throw new HttpError(404, 'Page not found')
  const accessRole = await assertPageView(userId, page.id)
  return { ...page, accessRole }
}

export async function create(userId: string, dto: CreatePageDto) {
  await assertSpaceEdit(userId, dto.spaceId)
  const space = await prisma.space.findUnique({ where: { id: dto.spaceId }, select: { workspaceId: true } })
  if (!space) throw new HttpError(404, 'Space not found')
  if (space.workspaceId !== dto.workspaceId) throw new HttpError(400, 'Space belongs to another workspace')
  return pagesRepository.create(dto)
}

export async function update(userId: string, pageId: string, dto: UpdatePageDto) {
  const page = await pagesRepository.findById(pageId)
  if (!page) throw new HttpError(404, 'Page not found')
  await assertPageEdit(userId, page.id)
  return pagesRepository.update(pageId, dto)
}

export async function remove(userId: string, pageId: string) {
  const page = await pagesRepository.findById(pageId)
  if (!page) throw new HttpError(404, 'Page not found')
  await assertPageEdit(userId, page.id)
  return pagesRepository.remove(pageId)
}
