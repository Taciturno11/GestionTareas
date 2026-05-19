import type { TaskSettings } from '@/types/taskSettings'

export function mapById<T extends { id: string }>(items: T[]) {
  return Object.fromEntries(items.map(item => [item.id, item])) as Record<string, T>
}

export function getProjectLabels(settings: TaskSettings) {
  return Object.fromEntries(settings.projects.map(project => [project.id, project.label]))
}

export function getProjectColors(settings: TaskSettings) {
  return Object.fromEntries(settings.projects.map(project => [project.id, project.color ?? '#64748B']))
}

export function getLabelColors(settings: TaskSettings) {
  return Object.fromEntries(
    settings.labels.map(label => [label.id, { bg: label.bg, text: label.text }]),
  )
}

export function getPriorityColors(settings: TaskSettings) {
  return Object.fromEntries(
    settings.priorities.map(priority => [priority.id, { bg: priority.bg, text: priority.text }]),
  )
}
