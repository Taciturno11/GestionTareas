import type { KpiStat, Project, ActivityItem, UpcomingTask } from '../types/home'

/* ─────────────────────── KPI Stats ─────────────────────── */
export const mockStats: KpiStat[] = [
  {
    label: 'Total Tareas',
    value: 24,
    icon: '📋',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    delta: '+4 esta semana',
  },
  {
    label: 'Completadas',
    value: 8,
    icon: '✅',
    color: '#10B981',
    bgColor: '#D1FAE5',
    delta: '+2 esta semana',
  },
  {
    label: 'En Progreso',
    value: 10,
    icon: '🚀',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    delta: '3 vencen pronto',
  },
  {
    label: 'Pendientes',
    value: 6,
    icon: '⏳',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    delta: '2 sin asignar',
  },
]

/* ─────────────────────── Projects ─────────────────────── */
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Rediseño del Dashboard',
    description: 'Modernizar la interfaz principal con nuevo sistema de diseño.',
    progress: 65,
    color: '#4F46E5',
    teamAvatars: ['MN', 'AL', 'CR'],
    dueDate: '30 abr',
    totalTasks: 12,
    completedTasks: 8,
  },
  {
    id: 'proj-2',
    name: 'API de Autenticación',
    description: 'Implementar login, registro y manejo de sesiones con JWT.',
    progress: 40,
    color: '#10B981',
    teamAvatars: ['LT', 'MN'],
    dueDate: '15 may',
    totalTasks: 8,
    completedTasks: 3,
  },
  {
    id: 'proj-3',
    name: 'Sistema de Notificaciones',
    description: 'Alertas en tiempo real para asignaciones y vencimientos.',
    progress: 20,
    color: '#F59E0B',
    teamAvatars: ['CR', 'AL', 'LT', 'MN'],
    dueDate: '1 jun',
    totalTasks: 10,
    completedTasks: 2,
  },
  {
    id: 'proj-4',
    name: 'Módulo de Reportes',
    description: 'Generar reportes de productividad por equipo y período.',
    progress: 80,
    color: '#8B5CF6',
    teamAvatars: ['MN', 'CR'],
    dueDate: '25 abr',
    totalTasks: 6,
    completedTasks: 5,
  },
]

/* ─────────────────────── Activity Feed ─────────────────────── */
export const mockActivity: ActivityItem[] = [
  {
    id: 'act-1',
    actor: 'MN',
    actorColor: { bg: '#EDE9FE', text: '#5B21B6' },
    action: 'movió',
    target: '"Pulir el login inicial" → Completada',
    timeAgo: 'hace 5 min',
  },
  {
    id: 'act-2',
    actor: 'AL',
    actorColor: { bg: '#DBEAFE', text: '#1D4ED8' },
    action: 'añadió comentario en',
    target: '"Construir vista kanban"',
    timeAgo: 'hace 1 h',
  },
  {
    id: 'act-3',
    actor: 'LT',
    actorColor: { bg: '#D1FAE5', text: '#065F46' },
    action: 'creó tarea',
    target: '"Revisar responsive del tablero"',
    timeAgo: 'hace 2 h',
  },
  {
    id: 'act-4',
    actor: 'CR',
    actorColor: { bg: '#FFE4E6', text: '#9F1239' },
    action: 'actualizó prioridad de',
    target: '"Preparar vista de línea" → Alta',
    timeAgo: 'hace 3 h',
  },
  {
    id: 'act-5',
    actor: 'MN',
    actorColor: { bg: '#EDE9FE', text: '#5B21B6' },
    action: 'asignó a CR en',
    target: '"Modelar estados editables"',
    timeAgo: 'ayer, 17:42',
  },
  {
    id: 'act-6',
    actor: 'AL',
    actorColor: { bg: '#DBEAFE', text: '#1D4ED8' },
    action: 'completó',
    target: '"Ordenar la mock data inicial"',
    timeAgo: 'ayer, 15:10',
  },
]

/* ─────────────────────── Upcoming Tasks ─────────────────────── */
export const mockUpcoming: UpcomingTask[] = [
  {
    id: 'up-1',
    title: 'Definir estructura del dashboard',
    dueLabel: 'Hoy',
    urgency: 'high',
    assignee: 'MN',
  },
  {
    id: 'up-2',
    title: 'Preparar vista de línea',
    dueLabel: 'Mañana',
    urgency: 'high',
    assignee: 'CR',
  },
  {
    id: 'up-3',
    title: 'Revisar tono visual del dashboard',
    dueLabel: 'En 2 días',
    urgency: 'medium',
    assignee: 'LT',
  },
  {
    id: 'up-4',
    title: 'Construir vista kanban principal',
    dueLabel: 'En 2 días',
    urgency: 'medium',
    assignee: 'AL',
  },
  {
    id: 'up-5',
    title: 'Modelar estados editables',
    dueLabel: 'En 3 días',
    urgency: 'low',
    assignee: 'LT',
  },
]
