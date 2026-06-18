import { assertWorkspaceMember } from '../../shared/utils/access.js'
import type { UpsertTaskSettingsDto } from './task-settings.dto.js'
import * as taskSettingsRepository from './task-settings.repository.js'
import { createInitialTaskSettings } from './task-settings.defaults.js'

export async function get(userId: string, workspaceId: string) {
  await assertWorkspaceMember(userId, workspaceId)
  const existingSettings = await taskSettingsRepository.findByWorkspaceId(workspaceId)
  if (existingSettings) return existingSettings

  const user = await taskSettingsRepository.findUser(userId)
  if (!user) return null

  return taskSettingsRepository.upsert({
    workspaceId,
    ...createInitialTaskSettings(user),
  })
}

export async function upsert(userId: string, dto: UpsertTaskSettingsDto) {
  await assertWorkspaceMember(userId, dto.workspaceId)
  return taskSettingsRepository.upsert(dto)
}
