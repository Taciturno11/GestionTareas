import { pagesApi } from '@/api/pages.api'
import { spacesApi } from '@/api/spaces.api'
import { workspacesApi } from '@/api/workspaces.api'
import { loadActiveWorkspaceId, saveWorkspaceDataSnapshot } from '@/data/workspaces'
import type { Workspace, WorkspacePage, WorkspaceSpace } from '@/types/workspace'

export const BACKEND_SYNC_EVENT = 'gt-backend-sync'

export interface BackendWorkspaceData {
  workspaces: Workspace[]
  spaces: WorkspaceSpace[]
  pages: WorkspacePage[]
}

let pendingWorkspaceSync: Promise<BackendWorkspaceData> | null = null

async function fetchBackendWorkspaceData(): Promise<BackendWorkspaceData> {
  const workspaces = await workspacesApi.list()
  const spaces: WorkspaceSpace[] = []
  const pages: WorkspacePage[] = []

  for (const workspace of workspaces) {
    const [workspaceSpaces, workspacePages] = await Promise.all([
      spacesApi.list(workspace.id),
      pagesApi.list(workspace.id),
    ])

    spaces.push(...workspaceSpaces)
    pages.push(...workspacePages)
  }

  return { workspaces, spaces, pages }
}

export async function syncBackendWorkspaceDataToLocalStorage() {
  pendingWorkspaceSync ??= fetchBackendWorkspaceData().finally(() => {
    pendingWorkspaceSync = null
  })

  const data = await pendingWorkspaceSync
  const currentActiveWorkspaceId = loadActiveWorkspaceId()
  const activeWorkspaceExists = data.workspaces.some(workspace => workspace.id === currentActiveWorkspaceId)
  const nextActiveWorkspaceId = activeWorkspaceExists
    ? currentActiveWorkspaceId
    : data.workspaces[0]?.id

  saveWorkspaceDataSnapshot({
    ...data,
    activeWorkspaceId: nextActiveWorkspaceId,
  })
  window.dispatchEvent(new CustomEvent(BACKEND_SYNC_EVENT))

  return data
}
