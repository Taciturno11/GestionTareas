import { useEffect, useState } from 'react'

import {
  loadActiveWorkspaceId,
  loadWorkspacePages,
  loadWorkspaceSpaces,
  loadWorkspaces,
  saveActiveWorkspaceId,
  WORKSPACE_DATA_CHANGE_EVENT,
} from '@/data/workspaces'
import type { Workspace, WorkspacePage, WorkspaceSpace } from '@/types/workspace'

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => loadWorkspaces())
  const [spaces, setSpaces] = useState<WorkspaceSpace[]>(() => loadWorkspaceSpaces())
  const [pages, setPages] = useState<WorkspacePage[]>(() => loadWorkspacePages())
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState(() => loadActiveWorkspaceId())

  useEffect(() => {
    const syncWorkspaceData = () => {
      setWorkspaces(loadWorkspaces())
      setSpaces(loadWorkspaceSpaces())
      setPages(loadWorkspacePages())
      setActiveWorkspaceIdState(loadActiveWorkspaceId())
    }

    window.addEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncWorkspaceData)
    return () => window.removeEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncWorkspaceData)
  }, [])

  function setActiveWorkspaceId(workspaceId: string) {
    setActiveWorkspaceIdState(workspaceId)
    saveActiveWorkspaceId(workspaceId)
  }

  return {
    workspaces,
    spaces,
    pages,
    activeWorkspaceId,
    setActiveWorkspaceId,
  }
}
