import type { TaskSettings } from '@/types/taskSettings'

const TASK_SETTINGS_KEY = 'gt_task_settings'

export const defaultTaskSettings: TaskSettings = {
  projects: [
    { id: 'job-1', label: 'Trabajo 1', color: '#6366f1' },
    { id: 'job-2', label: 'Trabajo 2', color: '#10b981' },
  ],
  assignees: [
    { id: 'AG', bg: '#EDE9FE', text: '#5B21B6', fullName: 'Ana Gomez' },
    { id: 'LT', bg: '#DBEAFE', text: '#1D4ED8', fullName: 'Lucia Torres' },
    { id: 'ML', bg: '#D1FAE5', text: '#065F46', fullName: 'Miguel Lopez' },
    { id: 'CR', bg: '#FFE4E6', text: '#9F1239', fullName: 'Carlos Ruiz' },
    { id: 'SD', bg: '#FEF9C3', text: '#713F12', fullName: 'Sofia Diaz' },
    { id: 'MN', bg: '#E0E7FF', text: '#3730A3', fullName: 'Martin Nauca Gamboa' },
  ],
  labels: [
    { id: 'Diseño', label: 'Diseño', bg: '#DBEAFE', text: '#1D4ED8' },
    { id: 'Reunión', label: 'Reunión', bg: '#EDE9FE', text: '#5B21B6' },
    { id: 'Desarrollo', label: 'Desarrollo', bg: '#D1FAE5', text: '#065F46' },
    { id: 'Finanzas', label: 'Finanzas', bg: '#FEF3C7', text: '#92400E' },
    { id: 'General', label: 'General', bg: '#F3F4F6', text: '#374151' },
  ],
  priorities: [
    { id: 'Alta', label: 'Alta', bg: '#FEE2E2', text: '#B91C1C' },
    { id: 'Media', label: 'Media', bg: '#FEF3C7', text: '#92400E' },
    { id: 'Baja', label: 'Baja', bg: '#F1F5F9', text: '#64748B' },
  ],
  statuses: [
    { id: 'pendiente', label: 'Pendiente', dot: '#F59E0B' },
    { id: 'progreso', label: 'En Progreso', dot: '#3B82F6' },
    { id: 'completado', label: 'Completado', dot: '#10B981' },
  ],
}

function mergeSettings(settings: Partial<TaskSettings>): TaskSettings {
  const priorities = settings.priorities ?? defaultTaskSettings.priorities

  return {
    projects: settings.projects ?? defaultTaskSettings.projects,
    assignees: settings.assignees ?? defaultTaskSettings.assignees,
    labels: settings.labels ?? defaultTaskSettings.labels,
    priorities: priorities.map(priority => {
      const normalized = priority.label.trim().toLowerCase()
      if (normalized === 'alta') return { ...priority, bg: '#FEE2E2', text: '#B91C1C' }
      if (normalized === 'media') return { ...priority, bg: '#FEF3C7', text: '#92400E' }
      if (normalized === 'baja') return { ...priority, bg: '#F1F5F9', text: '#64748B' }
      return priority
    }),
    statuses: settings.statuses ?? defaultTaskSettings.statuses,
  }
}

export const emptyTaskSettings: TaskSettings = {
  projects: [],
  assignees: [],
  labels: [],
  priorities: defaultTaskSettings.priorities,
  statuses: defaultTaskSettings.statuses,
}

function taskSettingsKey(workspaceId?: string) {
  return workspaceId ? `${TASK_SETTINGS_KEY}:${workspaceId}` : TASK_SETTINGS_KEY
}

export function loadTaskSettings(workspaceId?: string): TaskSettings {
  const saved = localStorage.getItem(taskSettingsKey(workspaceId))
  if (!saved) return emptyTaskSettings

  try {
    return mergeSettings(JSON.parse(saved))
  } catch {
    return emptyTaskSettings
  }
}

export function saveTaskSettings(settings: TaskSettings, workspaceId?: string) {
  localStorage.setItem(taskSettingsKey(workspaceId), JSON.stringify(settings))
  window.dispatchEvent(new CustomEvent('gt-task-settings-change', {
    detail: { workspaceId, settings },
  }))
}
