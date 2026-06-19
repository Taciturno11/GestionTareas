import { useEffect, useState } from 'react'

import {
  loadActiveWorkspaceId,
  loadWorkspaceSpaces,
  loadWorkspaces,
  saveActiveWorkspaceId,
  WORKSPACE_DATA_CHANGE_EVENT,
} from '@/data/workspaces'
import { getAuthToken } from '@/services/auth-token'
import { syncBackendWorkspaceDataToLocalStorage } from '@/services/backend-sync'
import type { Workspace, WorkspaceSpace } from '@/types/workspace'

let hasRequestedBackendWorkspaceData = false

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => loadWorkspaces())
  const [spaces, setSpaces] = useState<WorkspaceSpace[]>(() => loadWorkspaceSpaces())
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState(() => loadActiveWorkspaceId())

  useEffect(() => {
    const syncWorkspaceData = () => {
      setWorkspaces(loadWorkspaces())
      setSpaces(loadWorkspaceSpaces())
      setActiveWorkspaceIdState(loadActiveWorkspaceId())
    }

    window.addEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncWorkspaceData)
    return () => window.removeEventListener(WORKSPACE_DATA_CHANGE_EVENT, syncWorkspaceData)
  }, [])

  useEffect(() => {
    if (!getAuthToken() || hasRequestedBackendWorkspaceData) return

    let cancelled = false
    hasRequestedBackendWorkspaceData = true

    syncBackendWorkspaceDataToLocalStorage()
      .then(data => {
        if (cancelled) return
        setWorkspaces(data.workspaces)
        setSpaces(data.spaces)
        setActiveWorkspaceIdState(loadActiveWorkspaceId())
      })
      .catch(error => {
        hasRequestedBackendWorkspaceData = false
        console.warn('No se pudo cargar workspaces desde API. Se usara localStorage.', error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  function setActiveWorkspaceId(workspaceId: string) {
    setActiveWorkspaceIdState(workspaceId)
    saveActiveWorkspaceId(workspaceId)
  }

  return {
    workspaces,
    spaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
  }
}
