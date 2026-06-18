import type { Task } from '@/types/task'
import { expectArray, http } from './http'

export interface CreateTaskRequest {
  id?: string
  workspaceId: string
  pageId?: string | null
  title: string
  description?: string
  status: string
  priority: string
  projectId?: string | null
  tag?: string
  assigneeId?: string | null
  startDate?: string | null
  endDate?: string | null
  color?: string | null
  notes?: string
  position?: number
}

export type UpdateTaskRequest = Partial<Omit<CreateTaskRequest, 'workspaceId'>>

export const tasksApi = {
  list: async (workspaceId: string, pageId?: string) => {
    const payload = await http<unknown>('/tasks', { query: { workspaceId, pageId } })
    return expectArray<Task>(payload, 'tasks')
  },
  create: (body: CreateTaskRequest) => http<Task>('/tasks', { method: 'POST', body }),
  update: (id: string, body: UpdateTaskRequest) => http<Task>(`/tasks/${id}`, { method: 'PATCH', body }),
  remove: (id: string) => http<void>(`/tasks/${id}`, { method: 'DELETE' }),
}
