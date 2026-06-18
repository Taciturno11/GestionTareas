import { expectArray, http } from './http'
import { normalizeWorkspace } from './workspace.mappers'

export interface CreateWorkspaceRequest {
  id?: string
  name: string
  color?: string
}

export type UpdateWorkspaceRequest = Partial<CreateWorkspaceRequest>

export const workspacesApi = {
  list: async () => {
    const payload = await http<unknown>('/workspaces')
    return expectArray<unknown>(payload, 'workspaces').map(normalizeWorkspace)
  },
  get: async (id: string) => normalizeWorkspace(await http<unknown>(`/workspaces/${id}`)),
  create: async (body: CreateWorkspaceRequest) => normalizeWorkspace(await http<unknown>('/workspaces', { method: 'POST', body })),
  update: async (id: string, body: UpdateWorkspaceRequest) => normalizeWorkspace(await http<unknown>(`/workspaces/${id}`, { method: 'PATCH', body })),
  remove: (id: string) => http<void>(`/workspaces/${id}`, { method: 'DELETE' }),
}
