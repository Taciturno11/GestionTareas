import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { taskSettingsApi } from '@/api/task-settings.api'
import { loadTaskSettings, saveTaskSettings } from '@/data/taskSettings'
import { getAuthToken } from '@/services/auth-token'
import type { TaskSettings } from '@/types/taskSettings'

export function useTaskSettings(workspaceId?: string) {
  const queryClient = useQueryClient()
  const [localSettings, setLocalSettings] = useState<TaskSettings>(() => loadTaskSettings(workspaceId))
  const [mutationError, setMutationError] = useState<unknown>(null)
  const queryKey = ['task-settings', workspaceId] as const
  const settingsQuery = useQuery({
    queryKey,
    queryFn: () => taskSettingsApi.get(workspaceId!),
    enabled: Boolean(workspaceId && getAuthToken()),
  })
  const settings = settingsQuery.data ?? localSettings

  useEffect(() => {
    const syncSettings = () => setLocalSettings(loadTaskSettings(workspaceId))

    window.addEventListener('gt-task-settings-change', syncSettings)
    return () => window.removeEventListener('gt-task-settings-change', syncSettings)
  }, [workspaceId])

  useEffect(() => {
    Promise.resolve().then(() => setLocalSettings(loadTaskSettings(workspaceId)))
  }, [workspaceId])

  useEffect(() => {
    if (!settingsQuery.data) return
    localStorage.setItem(
      workspaceId ? `gt_task_settings:${workspaceId}` : 'gt_task_settings',
      JSON.stringify(settingsQuery.data),
    )
  }, [settingsQuery.data, workspaceId])

  function updateSettings(nextSettings: TaskSettings | ((prev: TaskSettings) => TaskSettings)) {
    const resolvedSettings = typeof nextSettings === 'function'
      ? nextSettings(settings)
      : nextSettings

    setLocalSettings(resolvedSettings)
    saveTaskSettings(resolvedSettings, workspaceId)
    if (workspaceId && getAuthToken()) {
      queryClient.setQueryData(queryKey, resolvedSettings)
      taskSettingsApi.upsert({ workspaceId, ...resolvedSettings })
        .then(savedSettings => {
          queryClient.setQueryData(queryKey, savedSettings)
          saveTaskSettings(savedSettings, workspaceId)
          setMutationError(null)
        })
        .catch(setMutationError)
    }
  }

  return {
    settings,
    setSettings: updateSettings,
    error: mutationError ?? settingsQuery.error,
    refresh: settingsQuery.refetch,
  }
}
