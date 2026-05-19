import { useEffect, useState } from 'react'

import { loadTaskSettings, saveTaskSettings } from '@/data/taskSettings'
import type { TaskSettings } from '@/types/taskSettings'

export function useTaskSettings() {
  const [settings, setSettings] = useState<TaskSettings>(() => loadTaskSettings())

  useEffect(() => {
    const syncSettings = () => setSettings(loadTaskSettings())

    window.addEventListener('gt-task-settings-change', syncSettings)
    return () => window.removeEventListener('gt-task-settings-change', syncSettings)
  }, [])

  function updateSettings(nextSettings: TaskSettings) {
    setSettings(nextSettings)
    saveTaskSettings(nextSettings)
  }

  return {
    settings,
    setSettings: updateSettings,
  }
}
