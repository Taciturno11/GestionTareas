import type { TaskSettings } from '@/types/taskSettings'
import { http } from './http'

export type UpsertTaskSettingsRequest = TaskSettings & {
  workspaceId: string
}

export const taskSettingsApi = {
  get: (workspaceId: string) => http<TaskSettings | null>('/task-settings', { query: { workspaceId } }),
  upsert: (body: UpsertTaskSettingsRequest) => http<TaskSettings>('/task-settings', { method: 'PUT', body }),
}
