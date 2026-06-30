import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

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
  const corruptedDash = '\u00e2\u20ac\u201d'
  return value && value !== '—' && value !== corruptedDash ? value : null
}

type LocalTaskLike = Partial<Task> & {
  id: string
  colId?: string
  assignee?: string
}

function toCreateRequest(task: LocalTaskLike, workspaceId: string, position: number): CreateTaskRequest {
  return {
    id: task.id,
    workspaceId,
    pageId: task.pageId ?? null,
    title: task.title || 'Tarea sin titulo',
    description: task.description ?? '',
    status: task.status ?? task.colId ?? 'pendiente',
    priority: task.priority ?? 'Media',
    projectId: task.projectId ?? null,
    tag: task.tag ?? 'General',
    assigneeId: task.assigneeId ?? null,
    startDate: cleanDate(task.startDate),
    endDate: cleanDate(task.endDate),
    color: task.color ?? null,
    notes: task.notes ?? '',
    position,
  }
}

interface UseTasksOptions<T> {
  workspaceId?: string
  pageId?: string
  includeArchived?: boolean
  fromApi?: (tasks: Task[]) => T
  toApi?: (task: unknown) => LocalTaskLike
}

export function useTasks<T>(fallback: T, options: UseTasksOptions<T> = {}) {
  const { workspaceId, pageId, includeArchived = false, fromApi, toApi } = options
  const queryClient = useQueryClient()
  const [localTasks, setLocalTasks] = useState<T>(() => loadLocalTasks(fallback))
  const [mutationError, setMutationError] = useState<unknown>(null)
  const queryKey = ['tasks', workspaceId, pageId ?? null] as const
  const tasksQuery = useQuery<Task[], Error, T>({
    queryKey,
    queryFn: () => tasksApi.list(workspaceId!, pageId, includeArchived),
    enabled: Boolean(workspaceId && getAuthToken()),
    select: remoteTasks => fromApi ? fromApi(remoteTasks) : remoteTasks as T,
  })
  const tasks = tasksQuery.data ?? localTasks

  useEffect(() => {
    const syncTasks = () => setLocalTasks(loadLocalTasks(fallback))

    window.addEventListener(TASKS_CHANGE_EVENT, syncTasks)
    window.addEventListener('storage', syncTasks)
    return () => {
      window.removeEventListener(TASKS_CHANGE_EVENT, syncTasks)
      window.removeEventListener('storage', syncTasks)
    }
  }, [fallback])

  useEffect(() => {
    if (!tasksQuery.data) return
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasksQuery.data))
  }, [tasksQuery.data])

  function setTasks(nextTasks: T | ((prev: T) => T)) {
    const previousTasks = tasks
    const resolvedTasks = typeof nextTasks === 'function'
      ? (nextTasks as (current: T) => T)(previousTasks)
      : nextTasks

    setLocalTasks(resolvedTasks)
    saveLocalTasks(resolvedTasks)
    if (workspaceId && getAuthToken() && isTaskArray(previousTasks) && isTaskArray(resolvedTasks)) {
      const previousById = new Map(previousTasks.map(task => [task.id, task]))
      const previousPositionById = new Map(previousTasks.map((task, position) => [task.id, position]))
      const nextById = new Map(resolvedTasks.map(task => [task.id, task]))
      const cachedTasks = queryClient.getQueryData<Task[]>(queryKey) ?? []
      const cachedById = new Map(cachedTasks.map(task => [task.id, task]))
      const now = new Date().toISOString()
      const requests: Promise<Task | void>[] = []

      const optimisticTasks = resolvedTasks.map((task, position) => {
        const body = toCreateRequest(toApi ? toApi(task) : task, workspaceId, position)
        const existing = cachedById.get(task.id)

        return {
          ...existing,
          id: task.id,
          workspaceId,
          pageId: body.pageId ?? null,
          title: body.title,
          description: body.description ?? '',
          status: body.status,
          priority: body.priority,
          projectId: body.projectId ?? null,
          tag: body.tag ?? 'General',
          assigneeId: body.assigneeId ?? null,
          startDate: body.startDate ?? null,
          endDate: body.endDate ?? null,
          color: body.color ?? null,
          notes: body.notes ?? '',
          position,
          archivedAt: existing?.archivedAt ?? null,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        } satisfies Task
      })

      queryClient.setQueryData(queryKey, optimisticTasks)

      resolvedTasks.forEach((task, position) => {
        const body = toCreateRequest(toApi ? toApi(task) : task, workspaceId, position)
        const previousTask = previousById.get(task.id)

        if (previousTask) {
          const previousBody = toCreateRequest(
            toApi ? toApi(previousTask) : previousTask,
            workspaceId,
            previousPositionById.get(task.id) ?? position,
          )

          if (JSON.stringify(previousBody) === JSON.stringify(body)) return
          requests.push(tasksApi.update(task.id, body))
        } else {
          requests.push(tasksApi.create(body))
        }
      })

      previousTasks.forEach(task => {
        if (!nextById.has(task.id)) requests.push(tasksApi.remove(task.id))
      })

      if (requests.length > 0) {
        Promise.all(requests)
          .then(savedTasks => {
            const savedById = new Map(
              savedTasks
                .filter((task): task is Task => Boolean(task && 'id' in task))
                .map(task => [task.id, task]),
            )

            queryClient.setQueryData<Task[]>(queryKey, currentTasks =>
              currentTasks?.map(task => savedById.get(task.id) ?? task) ?? optimisticTasks
            )
            setMutationError(null)
          })
          .catch(error => {
            setMutationError(error)
            queryClient.invalidateQueries({ queryKey })
          })
      }
    }
  }

  async function archiveTasks(taskIds: string[]) {
    const taskIdSet = new Set(taskIds)
    const currentTasks = isTaskArray(tasks)
      ? tasks
      : []
    const nextTasks = currentTasks.filter(task => !taskIdSet.has(task.id))

    setLocalTasks(nextTasks as T)
    saveLocalTasks(nextTasks as T)

    if (workspaceId && getAuthToken()) {
      try {
        await Promise.all(taskIds.map(taskId => tasksApi.archive(taskId)))
        queryClient.setQueryData<Task[]>(queryKey, cachedTasks =>
          cachedTasks?.filter(task => !taskIdSet.has(task.id)) ?? []
        )
        setMutationError(null)
        void queryClient.invalidateQueries({ queryKey })
      } catch (error) {
        setLocalTasks(currentTasks as T)
        saveLocalTasks(currentTasks as T)
        setMutationError(error)
        queryClient.invalidateQueries({ queryKey })
        throw error
      }
    }
  }

  function archiveTask(taskId: string) {
    return archiveTasks([taskId])
  }

  return {
    tasks,
    setTasks,
    archiveTask,
    archiveTasks,
    error: mutationError ?? tasksQuery.error,
    refresh: tasksQuery.refetch,
  }
}
