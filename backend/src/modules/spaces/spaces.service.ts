import { assertSpaceEdit, assertWorkspaceMember } from '../../shared/utils/access.js'
import { HttpError } from '../../shared/utils/http-error.js'
import type { CreateSpaceDto, UpdateSpaceDto } from './spaces.dto.js'
import * as spacesRepository from './spaces.repository.js'

export async function list(userId: string, workspaceId: string) {
  await assertWorkspaceMember(userId, workspaceId)
  return spacesRepository.findMany(workspaceId)
}

export async function create(userId: string, dto: CreateSpaceDto) {
  if (dto.parentId) {
    const parent = await spacesRepository.findById(dto.parentId)
    if (!parent) throw new HttpError(404, 'Parent space not found')
    if (parent.workspaceId !== dto.workspaceId) throw new HttpError(400, 'Parent space belongs to another workspace')
    await assertSpaceEdit(userId, dto.parentId)
  } else {
    await assertWorkspaceMember(userId, dto.workspaceId)
  }
  return spacesRepository.create(dto)
}

export async function update(userId: string, spaceId: string, dto: UpdateSpaceDto) {
  const space = await spacesRepository.findById(spaceId)
  if (!space) throw new HttpError(404, 'Space not found')
  await assertSpaceEdit(userId, space.id)
  if (dto.parentId && dto.parentId !== space.parentId) {
    const parent = await spacesRepository.findById(dto.parentId)
    if (!parent) throw new HttpError(404, 'Parent space not found')
    if (parent.workspaceId !== space.workspaceId) throw new HttpError(400, 'Parent space belongs to another workspace')
    await assertSpaceEdit(userId, parent.id)
  }
  return spacesRepository.update(spaceId, dto)
}

export async function archive(userId: string, spaceId: string) {
  const space = await spacesRepository.findById(spaceId)
  if (!space) throw new HttpError(404, 'Space not found')
  if (space.parentId) throw new HttpError(400, 'Only root spaces can be archived')
  await assertSpaceEdit(userId, space.id)
  return spacesRepository.archive(spaceId)
}

export async function restore(userId: string, spaceId: string) {
  const space = await spacesRepository.findById(spaceId)
  if (!space) throw new HttpError(404, 'Space not found')
  await assertSpaceEdit(userId, space.id)
  return spacesRepository.restore(spaceId)
}

export async function remove(userId: string, spaceId: string) {
  const space = await spacesRepository.findById(spaceId)
  if (!space) throw new HttpError(404, 'Space not found')
  await assertSpaceEdit(userId, space.id)
  return spacesRepository.remove(spaceId)
}
