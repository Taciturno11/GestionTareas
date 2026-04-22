import type { Task, TaskStatusOption } from '../types/task'

export const mockTaskStatuses: TaskStatusOption[] = [
  { id: 'backlog', label: 'Backlog', color: '#b08968' },
  { id: 'in_progress', label: 'En curso', color: '#3f5f87' },
  { id: 'review', label: 'Revision', color: '#6f6a63' },
  { id: 'completed', label: 'Completada', color: '#557a60' },
]

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Definir estructura del dashboard',
    description:
      'Organizar la jerarquia visual general y validar la distribucion del contenido principal.',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-04-22',
    createdAt: '2026-04-21',
    tag: 'Producto',
    assignee: 'MN',
    workspaceId: 'job-1',
  },
  {
    id: 'task-2',
    title: 'Construir vista kanban principal',
    description:
      'Definir columnas amplias, tarjetas sobrias y comportamiento de scroll horizontal.',
    status: 'backlog',
    priority: 'high',
    dueDate: '2026-04-24',
    createdAt: '2026-04-21',
    tag: 'Frontend',
    assignee: 'AL',
    workspaceId: 'job-1',
  },
  {
    id: 'task-3',
    title: 'Preparar vista de linea',
    description:
      'Crear una tabla limpia para revisar estado, prioridad, fecha y responsable.',
    status: 'review',
    priority: 'medium',
    dueDate: '2026-04-23',
    createdAt: '2026-04-20',
    tag: 'Frontend',
    assignee: 'CR',
    workspaceId: 'job-1',
  },
  {
    id: 'task-4',
    title: 'Pulir el login inicial',
    description:
      'Dejar la pantalla de acceso coherente con la identidad visual del tablero.',
    status: 'completed',
    priority: 'medium',
    dueDate: '2026-04-20',
    createdAt: '2026-04-18',
    tag: 'UI',
    assignee: 'MN',
    workspaceId: 'job-1',
  },
  {
    id: 'task-5',
    title: 'Modelar estados editables',
    description:
      'Permitir agregar estados nuevos y ajustar nombre o color desde el tablero.',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-04-25',
    createdAt: '2026-04-21',
    tag: 'Modelo',
    assignee: 'LT',
    workspaceId: 'job-1',
  },
  {
    id: 'task-6',
    title: 'Revisar responsive del tablero',
    description:
      'Comprobar que la experiencia en laptop y pantallas pequenas siga siendo clara.',
    status: 'backlog',
    priority: 'low',
    dueDate: '2026-04-26',
    createdAt: '2026-04-21',
    tag: 'QA',
    assignee: 'CR',
    workspaceId: 'job-2',
  },
  {
    id: 'task-7',
    title: 'Ordenar la mock data inicial',
    description:
      'Alinear datos de prueba con prioridades, etiquetas y responsables del proyecto.',
    status: 'completed',
    priority: 'medium',
    dueDate: '2026-04-19',
    createdAt: '2026-04-17',
    tag: 'Datos',
    assignee: 'AL',
    workspaceId: 'job-2',
  },
  {
    id: 'task-8',
    title: 'Definir siguiente paso del backend',
    description:
      'Dejar claro que ira en la API y que se mantendra temporalmente en el frontend.',
    status: 'backlog',
    priority: 'medium',
    dueDate: '2026-04-28',
    createdAt: '2026-04-21',
    tag: 'Arquitectura',
    assignee: 'MN',
    workspaceId: 'job-2',
  },
  {
    id: 'task-9',
    title: 'Revisar tono visual del dashboard',
    description:
      'Mantener una estetica formal, minimalista y cercana a la maqueta aprobada.',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2026-04-24',
    createdAt: '2026-04-21',
    tag: 'Diseno',
    assignee: 'LT',
    workspaceId: 'job-2',
  },
]
