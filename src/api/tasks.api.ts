import type { Task } from '@/types/task'
import { http } from './http'

export interface CreateTaskRequest {
  workspaceId: string
  pageId?: string | null
  title: string
  description?: string
  status: string
  priority: string
  tag?: string
  assigneeId?: string | null
  startDate?: string | null
  endDate?: string | null
  color?: string | null
  notes?: string
}

export type UpdateTaskRequest = Partial<Omit<CreateTaskRequest, 'workspaceId'>>

export const tasksApi = {
  list: (workspaceId: string, pageId?: string) => http<Task[]>('/tasks', { query: { workspaceId, pageId } }),
  create: (body: CreateTaskRequest) => http<Task>('/tasks', { method: 'POST', body }),
  update: (id: string, body: UpdateTaskRequest) => http<Task>(`/tasks/${id}`, { method: 'PATCH', body }),
  remove: (id: string) => http<void>(`/tasks/${id}`, { method: 'DELETE' }),
}
