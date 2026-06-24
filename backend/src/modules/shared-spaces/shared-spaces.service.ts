import { assertSpaceShareManager } from '../../shared/utils/access.js'
import { HttpError } from '../../shared/utils/http-error.js'
import * as friendsService from '../friends/friends.service.js'
import type { CreateSpaceShareDto, UpdateSpaceShareDto } from './shared-spaces.dto.js'
import * as repository from './shared-spaces.repository.js'

function isDescendantOrSelf(
  spaces: Array<{ id: string; parentId: string | null }>,
  rootId: string,
  targetId: string,
) {
  if (rootId === targetId) return true
  const byParent = new Map<string | null, Array<{ id: string; parentId: string | null }>>()
  spaces.forEach(space => {
    const siblings = byParent.get(space.parentId) ?? []
    siblings.push(space)
    byParent.set(space.parentId, siblings)
  })
  const queue = [...(byParent.get(rootId) ?? [])]
  while (queue.length) {
    const current = queue.shift()
    if (!current) continue
    if (current.id === targetId) return true
    queue.push(...(byParent.get(current.id) ?? []))
  }
  return false
}

export async function listReceived(userId: string) {
  const shares = await repository.findReceivedShares(userId)

  return Promise.all(shares.map(async share => {
    const [spaces, pages] = await Promise.all([
      repository.findWorkspaceSpaces(share.space.workspaceId),
      repository.findWorkspacePageSummaries(share.space.workspaceId),
    ])
    const sharedSpaceIds = new Set(
      spaces
        .filter(space => isDescendantOrSelf(spaces, share.spaceId, space.id))
        .map(space => space.id),
    )

    return {
      id: share.id,
      role: share.role,
      createdAt: share.createdAt,
      updatedAt: share.updatedAt,
      createdBy: share.createdBy,
      workspace: {
        id: share.space.workspace.id,
        name: share.space.workspace.name,
        color: share.space.workspace.color,
      },
      rootSpaceId: share.spaceId,
      spaces: spaces.filter(space => sharedSpaceIds.has(space.id)),
      pages: pages.filter(page => sharedSpaceIds.has(page.spaceId)),
    }
  }))
}

export async function listForSpace(userId: string, spaceId: string) {
  await assertSpaceShareManager(userId, spaceId)
  return repository.findManyForSpace(spaceId)
}

export async function create(userId: string, spaceId: string, dto: CreateSpaceShareDto) {
  const space = await repository.findSpaceById(spaceId)
  if (!space) throw new HttpError(404, 'Space not found')
  await assertSpaceShareManager(userId, spaceId)
  if (dto.userId === userId) throw new HttpError(400, 'Cannot share a space with yourself')

  const targetUser = await repository.findUserById(dto.userId)
  if (!targetUser) throw new HttpError(404, 'User not found')

  const targetMembership = await repository.findWorkspaceMember(dto.userId, space.workspaceId)
  if (targetMembership) throw new HttpError(400, 'User is already a workspace member')

  const areFriends = await friendsService.areFriends(userId, dto.userId)
  if (!areFriends) throw new HttpError(403, 'Solo puedes compartir espacios con amigos')

  const existing = await repository.findBySpaceAndUser(spaceId, dto.userId)
  if (existing) throw new HttpError(409, 'Space already shared with this user')

  return repository.create(spaceId, userId, dto)
}

export async function update(userId: string, spaceId: string, shareId: string, dto: UpdateSpaceShareDto) {
  await assertSpaceShareManager(userId, spaceId)
  const share = await repository.findById(shareId)
  if (!share || share.spaceId !== spaceId) throw new HttpError(404, 'Space share not found')
  return repository.update(shareId, dto)
}

export async function remove(userId: string, spaceId: string, shareId: string) {
  await assertSpaceShareManager(userId, spaceId)
  const share = await repository.findById(shareId)
  if (!share || share.spaceId !== spaceId) throw new HttpError(404, 'Space share not found')
  return repository.remove(shareId)
}
