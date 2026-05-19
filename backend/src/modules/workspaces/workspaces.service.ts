import { assertWorkspaceMember, assertWorkspaceOwner } from '../../shared/utils/access.js'
import { HttpError } from '../../shared/utils/http-error.js'
import type { CreateWorkspaceDto, UpdateWorkspaceDto } from './workspaces.dto.js'
import * as workspacesRepository from './workspaces.repository.js'

export function list(userId: string) {
  return workspacesRepository.findManyForUser(userId)
}

export async function get(userId: string, workspaceId: string) {
  await assertWorkspaceMember(userId, workspaceId)
  const workspace = await workspacesRepository.findById(workspaceId)
  if (!workspace) throw new HttpError(404, 'Workspace not found')
  return workspace
}

export function create(userId: string, dto: CreateWorkspaceDto) {
  return workspacesRepository.createForOwner(userId, dto)
}

export async function update(userId: string, workspaceId: string, dto: UpdateWorkspaceDto) {
  await assertWorkspaceOwner(userId, workspaceId)
  return workspacesRepository.update(workspaceId, dto)
}

export async function remove(userId: string, workspaceId: string) {
  await assertWorkspaceOwner(userId, workspaceId)
  return workspacesRepository.remove(workspaceId)
}
