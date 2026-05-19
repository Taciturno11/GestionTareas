import type { WorkspaceSpace } from '@/types/workspace'
import { http } from './http'

export interface CreateSpaceRequest {
  id?: string
  workspaceId: string
  parentId?: string | null
  name: string
  icon?: string
  iconColor?: string
  description?: string
  archived?: boolean
  archivedAt?: string | null
  collapsed?: boolean
}

export interface UpdateSpaceRequest {
  parentId?: string | null
  name?: string
  icon?: string
  iconColor?: string
  description?: string
  collapsed?: boolean
}

export const spacesApi = {
  list: (workspaceId: string) => http<WorkspaceSpace[]>('/spaces', { query: { workspaceId } }),
  create: (body: CreateSpaceRequest) => http<WorkspaceSpace>('/spaces', { method: 'POST', body }),
  update: (id: string, body: UpdateSpaceRequest) => http<WorkspaceSpace>(`/spaces/${id}`, { method: 'PATCH', body }),
  archive: (id: string) => http<WorkspaceSpace>(`/spaces/${id}/archive`, { method: 'POST' }),
  restore: (id: string) => http<WorkspaceSpace>(`/spaces/${id}/restore`, { method: 'POST' }),
  remove: (id: string) => http<void>(`/spaces/${id}`, { method: 'DELETE' }),
}
