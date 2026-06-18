import type { Project } from '@/types/project'
import { expectArray, http } from './http'

export interface CreateProjectRequest {
  workspaceId: string
  name: string
  color: string
}

export interface UpdateProjectRequest {
  name?: string
  color?: string
}

export const projectsApi = {
  list: async (workspaceId: string, includeArchived = false) => expectArray<Project>(
    await http<unknown>('/projects', { query: { workspaceId, includeArchived } }),
    'projects',
  ),
  create: (body: CreateProjectRequest) => http<Project>('/projects', { method: 'POST', body }),
  update: (id: string, body: UpdateProjectRequest) => http<Project>(`/projects/${id}`, { method: 'PATCH', body }),
  archive: (id: string) => http<Project>(`/projects/${id}/archive`, { method: 'POST' }),
  restore: (id: string) => http<Project>(`/projects/${id}/restore`, { method: 'POST' }),
}
