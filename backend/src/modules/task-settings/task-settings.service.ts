import { assertWorkspaceMember } from '../../shared/utils/access.js'
import type { UpsertTaskSettingsDto } from './task-settings.dto.js'
import * as taskSettingsRepository from './task-settings.repository.js'

export async function get(userId: string, workspaceId: string) {
  await assertWorkspaceMember(userId, workspaceId)
  return taskSettingsRepository.findByWorkspaceId(workspaceId)
}

export async function upsert(userId: string, dto: UpsertTaskSettingsDto) {
  await assertWorkspaceMember(userId, dto.workspaceId)
  return taskSettingsRepository.upsert(dto)
}
