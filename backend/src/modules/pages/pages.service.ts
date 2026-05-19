import { assertWorkspaceMember } from '../../shared/utils/access.js'
import { HttpError } from '../../shared/utils/http-error.js'
import type { CreatePageDto, UpdatePageDto } from './pages.dto.js'
import * as pagesRepository from './pages.repository.js'

export async function list(userId: string, workspaceId: string, spaceId?: string) {
  await assertWorkspaceMember(userId, workspaceId)
  return pagesRepository.findMany(workspaceId, spaceId)
}

export async function get(userId: string, pageId: string) {
  const page = await pagesRepository.findById(pageId)
  if (!page) throw new HttpError(404, 'Page not found')
  await assertWorkspaceMember(userId, page.workspaceId)
  return page
}

export async function create(userId: string, dto: CreatePageDto) {
  await assertWorkspaceMember(userId, dto.workspaceId)
  return pagesRepository.create(dto)
}

export async function update(userId: string, pageId: string, dto: UpdatePageDto) {
  const page = await pagesRepository.findById(pageId)
  if (!page) throw new HttpError(404, 'Page not found')
  await assertWorkspaceMember(userId, page.workspaceId)
  return pagesRepository.update(pageId, dto)
}

export async function remove(userId: string, pageId: string) {
  const page = await pagesRepository.findById(pageId)
  if (!page) throw new HttpError(404, 'Page not found')
  await assertWorkspaceMember(userId, page.workspaceId)
  return pagesRepository.remove(pageId)
}
