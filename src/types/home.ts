export interface Project {
  id: string
  name: string
  description: string
  progress: number        // 0-100
  color: string           // accent color
  teamAvatars: string[]   // initials
  dueDate: string
  totalTasks: number
  completedTasks: number
}

export interface ActivityItem {
  id: string
  actor: string           // initials
  actorColor: { bg: string; text: string }
  action: string
  target: string
  timeAgo: string
}

export interface UpcomingTask {
  id: string
  title: string
  dueLabel: string        // e.g. "Hoy", "Mañana", "En 2 días"
  urgency: 'high' | 'medium' | 'low'
  assignee: string
}

export interface KpiStat {
  label: string
  value: number
  icon: string            // emoji icon
  color: string           // accent hex
  bgColor: string         // light bg hex
  delta?: string          // e.g. "+3 esta semana"
}
