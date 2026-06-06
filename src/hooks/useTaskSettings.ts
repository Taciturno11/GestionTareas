import { useEffect, useState } from 'react'

import { taskSettingsApi } from '@/api/task-settings.api'
import { loadTaskSettings, saveTaskSettings } from '@/data/taskSettings'
import { getAuthToken } from '@/services/auth-token'
import type { TaskSettings } from '@/types/taskSettings'

export function useTaskSettings(workspaceId?: string) {
  const [settings, setSettings] = useState<TaskSettings>(() => loadTaskSettings())
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    const syncSettings = () => setSettings(loadTaskSettings())

    window.addEventListener('gt-task-settings-change', syncSettings)
    return () => window.removeEventListener('gt-task-settings-change', syncSettings)
  }, [])

  useEffect(() => {
    if (!workspaceId || !getAuthToken()) return

    let cancelled = false

    taskSettingsApi.get(workspaceId)
      .then(remoteSettings => {
        if (cancelled || !remoteSettings) return
        saveTaskSettings(remoteSettings)
        setSettings(remoteSettings)
        setError(null)
      })
      .catch(setError)

    return () => {
      cancelled = true
    }
  }, [workspaceId])

  function updateSettings(nextSettings: TaskSettings | ((prev: TaskSettings) => TaskSettings)) {
    setSettings(prev => {
      const resolvedSettings = typeof nextSettings === 'function'
        ? nextSettings(prev)
        : nextSettings

      saveTaskSettings(resolvedSettings)
      if (workspaceId && getAuthToken()) {
        taskSettingsApi.upsert({ workspaceId, ...resolvedSettings }).catch(setError)
      }

      return resolvedSettings
    })
  }

  return {
    settings,
    setSettings: updateSettings,
    error,
  }
}
