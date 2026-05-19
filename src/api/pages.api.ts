import type { WorkspacePage, WorkspacePageType } from '@/types/workspace'
import { http } from './http'

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

type ApiWorkspacePage = Omit<WorkspacePage, 'type'> & {
  type: string
}

function normalizePageType(type: string): WorkspacePageType {
  const normalized = type.toLowerCase()
  if (normalized === 'blank') return 'blank'
  if (normalized === 'board') return 'board'
  if (normalized === 'database') return 'database'
  if (normalized === 'tasks') return 'tasks'
  return 'text'
}

function normalizePage(page: ApiWorkspacePage): WorkspacePage {
  return {
    ...page,
    type: normalizePageType(page.type),
  }
}

export const pagesApi = {
  list: async (workspaceId: string, spaceId?: string) => {
    const pages = await http<ApiWorkspacePage[]>('/pages', { query: { workspaceId, spaceId } })
    return pages.map(normalizePage)
  },
  get: async (id: string) => normalizePage(await http<ApiWorkspacePage>(`/pages/${id}`)),
  create: async (body: CreatePageRequest) => normalizePage(await http<ApiWorkspacePage>('/pages', { method: 'POST', body })),
  update: async (id: string, body: UpdatePageRequest) => normalizePage(await http<ApiWorkspacePage>(`/pages/${id}`, { method: 'PATCH', body })),
  remove: (id: string) => http<void>(`/pages/${id}`, { method: 'DELETE' }),
}
