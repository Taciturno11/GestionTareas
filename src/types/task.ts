export type TaskPriority = 'low' | 'medium' | 'high'

export interface TaskStatusOption {
  id: string
  label: string
  color: string
}

import type { Project } from './project'

export interface Task {
  id: string
  pageId?: string | null
  title: string
  description: string
  status: string
  priority: TaskPriority | string
  projectId?: string | null
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt?: string
  archivedAt?: string | null
  tag: string
  assignee?: string
  assigneeId?: string | null
  workspaceId: string
  color?: string | null
  notes?: string
  position?: number
  project?: Project | null
}
