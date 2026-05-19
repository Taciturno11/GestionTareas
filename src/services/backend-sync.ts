import { pagesApi } from '@/api/pages.api'
import { spacesApi } from '@/api/spaces.api'
import { workspacesApi } from '@/api/workspaces.api'
import type { Workspace, WorkspacePage, WorkspaceSpace } from '@/types/workspace'

const WORKSPACES_KEY = 'gt_workspaces'
const WORKSPACE_SPACES_KEY = 'gt_workspace_spaces'
const WORKSPACE_PAGES_KEY = 'gt_workspace_pages'
const ACTIVE_WORKSPACE_KEY = 'gt_active_workspace'

export const BACKEND_SYNC_EVENT = 'gt-backend-sync'

export async function syncBackendWorkspaceDataToLocalStorage() {
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

  localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces satisfies Workspace[]))
  localStorage.setItem(WORKSPACE_SPACES_KEY, JSON.stringify(spaces))
  localStorage.setItem(WORKSPACE_PAGES_KEY, JSON.stringify(pages))

  if (workspaces.length && !localStorage.getItem(ACTIVE_WORKSPACE_KEY)) {
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaces[0].id)
  }

  window.dispatchEvent(new CustomEvent(BACKEND_SYNC_EVENT))
  window.dispatchEvent(new CustomEvent('gt-workspace-data-change'))

  return {
    workspaces,
    spaces,
    pages,
  }
}
