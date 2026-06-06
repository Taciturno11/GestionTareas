import { useEffect, useState } from 'react'

import { tasksApi, type CreateTaskRequest } from '@/api/tasks.api'
import { getAuthToken } from '@/services/auth-token'
import type { Task } from '@/types/task'

const TASKS_KEY = 'gt_tasks'
export const TASKS_CHANGE_EVENT = 'gt-tasks-change'

export function loadLocalTasks<T>(fallback: T): T {
  const saved = localStorage.getItem(TASKS_KEY)
  if (!saved) return fallback

  try {
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed)) {
      return parsed.map(item =>
        item && typeof item === 'object' && 'id' in item
          ? { ...item, id: String(item.id) }
          : item
      ) as T
    }
    return parsed as T
  } catch {
    return fallback
  }
}

export function saveLocalTasks<T>(tasks: T) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  window.dispatchEvent(new CustomEvent(TASKS_CHANGE_EVENT, { detail: tasks }))
}

function isTaskArray(value: unknown): value is Task[] {
  return Array.isArray(value)
}

function cleanDate(value: string | null | undefined) {
  return value && value !== '—' && value !== 'â€”' ? value : null
}

type LocalTaskLike = Partial<Task> & {
  id: string
  colId?: string
  assignee?: string
}

function toCreateRequest(task: LocalTaskLike, workspaceId: string): CreateTaskRequest {
  return {
    id: task.id,
    workspaceId,
    pageId: task.pageId ?? null,
    title: task.title || 'Tarea sin titulo',
    description: task.description ?? '',
    status: task.status ?? task.colId ?? 'pendiente',
    priority: task.priority ?? 'Media',
    projectId: task.projectId ?? task.workspaceId ?? null,
    tag: task.tag ?? 'General',
    assigneeId: task.assigneeId ?? null,
    startDate: cleanDate(task.startDate),
    endDate: cleanDate(task.endDate),
    color: task.color ?? null,
    notes: task.notes ?? '',
  }
}

interface UseTasksOptions<T> {
  workspaceId?: string
  pageId?: string
  fromApi?: (tasks: Task[]) => T
  toApi?: (task: unknown) => LocalTaskLike
}

export function useTasks<T>(fallback: T, options: UseTasksOptions<T> = {}) {
  const { workspaceId, pageId, fromApi, toApi } = options
  const [tasks, setTasksState] = useState<T>(() => loadLocalTasks(fallback))
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    const syncTasks = () => setTasksState(loadLocalTasks(fallback))

    window.addEventListener(TASKS_CHANGE_EVENT, syncTasks)
    window.addEventListener('storage', syncTasks)
    return () => {
      window.removeEventListener(TASKS_CHANGE_EVENT, syncTasks)
      window.removeEventListener('storage', syncTasks)
    }
  }, [fallback])

  useEffect(() => {
    if (!workspaceId || !getAuthToken()) return

    let cancelled = false

    tasksApi.list(workspaceId, pageId)
      .then(remoteTasks => {
        if (cancelled) return
        const nextTasks = fromApi ? fromApi(remoteTasks) : remoteTasks as T
        saveLocalTasks(nextTasks)
        setTasksState(nextTasks)
        setError(null)
      })
      .catch(setError)

    return () => {
      cancelled = true
    }
  }, [workspaceId, pageId, fromApi])

  function setTasks(nextTasks: T | ((prev: T) => T)) {
    setTasksState(prev => {
      const resolvedTasks = typeof nextTasks === 'function'
        ? (nextTasks as (current: T) => T)(prev)
        : nextTasks

      saveLocalTasks(resolvedTasks)
      if (workspaceId && getAuthToken() && isTaskArray(prev) && isTaskArray(resolvedTasks)) {
        const previousById = new Map(prev.map(task => [task.id, task]))
        const nextById = new Map(resolvedTasks.map(task => [task.id, task]))

        resolvedTasks.forEach(task => {
          const body = toCreateRequest(toApi ? toApi(task) : task, workspaceId)
          if (previousById.has(task.id)) {
            tasksApi.update(task.id, body).catch(setError)
          } else {
            tasksApi.create(body).catch(setError)
          }
        })

        prev.forEach(task => {
          if (!nextById.has(task.id)) tasksApi.remove(task.id).catch(setError)
        })
      }
      return resolvedTasks
    })
  }

  return {
    tasks,
    setTasks,
    error,
  }
}
