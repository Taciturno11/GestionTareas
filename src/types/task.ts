export type TaskPriority = 'low' | 'medium' | 'high'

export interface TaskStatusOption {
  id: string
  label: string
  color: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: TaskPriority
  dueDate: string
  createdAt: string
  tag: string
  assignee: string
}
