import type { Workspace } from '@/types/workspace'
import { http } from './http'

export interface CreateWorkspaceRequest {
  id?: string
  name: string
  color?: string
}

export type UpdateWorkspaceRequest = Partial<CreateWorkspaceRequest>

export const workspacesApi = {
  list: () => http<Workspace[]>('/workspaces'),
  get: (id: string) => http<Workspace>(`/workspaces/${id}`),
  create: (body: CreateWorkspaceRequest) => http<Workspace>('/workspaces', { method: 'POST', body }),
  update: (id: string, body: UpdateWorkspaceRequest) => http<Workspace>(`/workspaces/${id}`, { method: 'PATCH', body }),
  remove: (id: string) => http<void>(`/workspaces/${id}`, { method: 'DELETE' }),
}
