import { useEffect, useState } from 'react'

const TASKS_KEY = 'gt_tasks'
export const TASKS_CHANGE_EVENT = 'gt-tasks-change'

export function loadLocalTasks<T>(fallback: T): T {
  const saved = localStorage.getItem(TASKS_KEY)
  if (!saved) return fallback

  try {
    return JSON.parse(saved) as T
  } catch {
    return fallback
  }
}

export function saveLocalTasks<T>(tasks: T) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  window.dispatchEvent(new CustomEvent(TASKS_CHANGE_EVENT, { detail: tasks }))
}

export function useTasks<T>(fallback: T) {
  const [tasks, setTasksState] = useState<T>(() => loadLocalTasks(fallback))

  useEffect(() => {
    const syncTasks = () => setTasksState(loadLocalTasks(fallback))

    window.addEventListener(TASKS_CHANGE_EVENT, syncTasks)
    window.addEventListener('storage', syncTasks)
    return () => {
      window.removeEventListener(TASKS_CHANGE_EVENT, syncTasks)
      window.removeEventListener('storage', syncTasks)
    }
  }, [fallback])

  function setTasks(nextTasks: T | ((prev: T) => T)) {
    setTasksState(prev => {
      const resolvedTasks = typeof nextTasks === 'function'
        ? (nextTasks as (current: T) => T)(prev)
        : nextTasks

      saveLocalTasks(resolvedTasks)
      return resolvedTasks
    })
  }

  return {
    tasks,
    setTasks,
  }
}
