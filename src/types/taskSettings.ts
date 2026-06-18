export interface TaskProjectOption {
  id: string
  label: string
  color?: string
}

export interface TaskAssigneeOption {
  id: string
  initials?: string
  fullName: string
  bg: string
  text: string
}

export interface TaskLabelOption {
  id: string
  label: string
  bg: string
  text: string
}

export interface TaskPriorityOption {
  id: 'Alta' | 'Media' | 'Baja' | string
  label: string
  bg: string
  text: string
}

export interface TaskStatusSetting {
  id: string
  label: string
  dot: string
}

export interface TaskSettings {
  projects: TaskProjectOption[]
  assignees: TaskAssigneeOption[]
  labels: TaskLabelOption[]
  priorities: TaskPriorityOption[]
  statuses: TaskStatusSetting[]
}
