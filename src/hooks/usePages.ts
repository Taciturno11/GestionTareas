import { useQuery, useQueryClient } from '@tanstack/react-query'

import { pagesApi } from '@/api/pages.api'
import {
  loadWorkspacePages,
  updateWorkspacePageSummaryCache,
} from '@/data/workspaces'
import { getAuthToken } from '@/services/auth-token'
import type { WorkspacePage, WorkspacePageSummary } from '@/types/workspace'

export function pageSummariesKey(workspaceId?: string) {
  return ['pages', workspaceId] as const
}

export function pageDetailKey(pageId?: string) {
  return ['page', pageId] as const
}

export function usePageSummaries(workspaceId?: string) {
  return useQuery({
    queryKey: pageSummariesKey(workspaceId),
    queryFn: () => pagesApi.list(workspaceId!, undefined, false) as Promise<WorkspacePageSummary[]>,
    enabled: Boolean(workspaceId && getAuthToken()),
    initialData: () => workspaceId
      ? loadWorkspacePages().filter(page => page.workspaceId === workspaceId)
      : [],
    staleTime: 5 * 60 * 1000,
  })
}

export function usePage(pageId?: string) {
  return useQuery({
    queryKey: pageDetailKey(pageId),
    queryFn: () => pagesApi.get(pageId!),
    enabled: Boolean(pageId && getAuthToken()),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePageCache() {
  const queryClient = useQueryClient()

  function updateSummary(summary: WorkspacePageSummary) {
    updateWorkspacePageSummaryCache(summary.id, summary, { emit: true })
    queryClient.setQueryData<WorkspacePageSummary[]>(
      pageSummariesKey(summary.workspaceId),
      current => {
        if (!current) return [summary]
        const exists = current.some(page => page.id === summary.id)
        return exists
          ? current.map(page => page.id === summary.id ? summary : page)
          : [...current, summary]
      },
    )
  }

  function updateDetail(pageId: string, patch: Partial<WorkspacePage>) {
    queryClient.setQueryData<WorkspacePage>(
      pageDetailKey(pageId),
      current => current ? { ...current, ...patch } : current,
    )
  }

  function removePage(pageId: string, workspaceId: string) {
    queryClient.removeQueries({ queryKey: pageDetailKey(pageId) })
    queryClient.setQueryData<WorkspacePageSummary[]>(
      pageSummariesKey(workspaceId),
      current => current?.filter(page => page.id !== pageId) ?? [],
    )
  }

  return { updateSummary, updateDetail, removePage }
}
