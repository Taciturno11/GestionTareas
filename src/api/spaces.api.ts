import { expectArray, http } from './http'
import { normalizeSpace } from './workspace.mappers'

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
  list: async (workspaceId: string) => {
    const payload = await http<unknown>('/spaces', { query: { workspaceId } })
    return expectArray<unknown>(payload, 'spaces').map(normalizeSpace)
  },
  create: async (body: CreateSpaceRequest) => normalizeSpace(await http<unknown>('/spaces', { method: 'POST', body })),
  update: async (id: string, body: UpdateSpaceRequest) => normalizeSpace(await http<unknown>(`/spaces/${id}`, { method: 'PATCH', body })),
  archive: async (id: string) => normalizeSpace(await http<unknown>(`/spaces/${id}/archive`, { method: 'POST' })),
  restore: async (id: string) => normalizeSpace(await http<unknown>(`/spaces/${id}/restore`, { method: 'POST' })),
  remove: (id: string) => http<void>(`/spaces/${id}`, { method: 'DELETE' }),
}
