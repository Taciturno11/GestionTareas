import type { WorkspacePageType } from '@/types/workspace'
import { expectArray, http } from './http'
import { normalizePage, normalizePageSummary } from './workspace.mappers'

export interface CreatePageRequest {
  id?: string
  workspaceId: string
  spaceId: string
  title: string
  type?: WorkspacePageType
  content?: string
}

export interface UpdatePageRequest {
  spaceId?: string
  title?: string
  type?: WorkspacePageType
  content?: string
}

export const pagesApi = {
  list: async (workspaceId: string, spaceId?: string, includeContent = false) => {
    const payload = await http<unknown>('/pages', {
      query: { workspaceId, spaceId, includeContent },
    })
    const pages = expectArray<unknown>(payload, 'pages')
    return includeContent ? pages.map(normalizePage) : pages.map(normalizePageSummary)
  },
  get: async (id: string) => normalizePage(await http<unknown>(`/pages/${id}`)),
  create: async (body: CreatePageRequest) => normalizePage(await http<unknown>('/pages', { method: 'POST', body })),
  update: async (id: string, body: UpdatePageRequest) => normalizePageSummary(
    await http<unknown>(`/pages/${id}`, { method: 'PATCH', body }),
  ),
  remove: (id: string) => http<void>(`/pages/${id}`, { method: 'DELETE' }),
}
