import {
  ArchiveBoxIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  HomeIcon,
  PaintBrushIcon,
  PlusIcon,
  RectangleStackIcon,
  SwatchIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import type { ComponentType, SVGProps } from 'react'

interface ThemeOption {
  id: string
  label: string
  swatch: string
  bg: string
  sidebar: string
  border: string
  card: string
  cardBg: string
  text: string
  sub: string
  accent: string
  pill: string
  shellShadow: string
  panelShadow: string
  cardShadow: string
}

interface BoardColumn {
  id: string
  label: string
  dot: string
}

type TaskPriority = 'Alta' | 'Media' | 'Baja'
type ViewMode = 'kanban' | 'lista'

interface BoardTask {
  id: number
  title: string
  colId: string
  priority: TaskPriority
  tag: string
  due: string
  assignee: string
}

interface NavigationItem {
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const THEMES: ThemeOption[] = [
  {
    id: 'crema',
    label: 'Crema',
    swatch: '#8b6c4c',
    bg: '#efe4d6',
    sidebar: '#fffdf9',
    border: '#ede8e0',
    card: '#fff',
    cardBg: '#fdf8f3',
    text: '#1c1917',
    sub: '#b5a898',
    accent: '#1c1917',
    pill: '#f5f0eb',
    shellShadow: '10px 0 34px rgba(114, 88, 60, 0.12)',
    panelShadow: '0 16px 34px rgba(114, 88, 60, 0.12)',
    cardShadow: '0 8px 18px rgba(114, 88, 60, 0.1)',
  },
  {
    id: 'limpio',
    label: 'Limpio',
    swatch: '#cbd5e1',
    bg: '#e9eff5',
    sidebar: '#fff',
    border: '#e2e8f0',
    card: '#fff',
    cardBg: '#f8fafc',
    text: '#0f172a',
    sub: '#94a3b8',
    accent: '#2563eb',
    pill: '#f1f5f9',
    shellShadow: '10px 0 34px rgba(59, 89, 128, 0.12)',
    panelShadow: '0 16px 34px rgba(59, 89, 128, 0.12)',
    cardShadow: '0 8px 18px rgba(59, 89, 128, 0.08)',
  },
  {
    id: 'sage',
    label: 'Sage',
    swatch: '#4f7a55',
    bg: '#dfe8da',
    sidebar: '#f4f8f2',
    border: '#cdddc8',
    card: '#f7fbf5',
    cardBg: '#edf3eb',
    text: '#1a2e1a',
    sub: '#7a9e7a',
    accent: '#2d6a2d',
    pill: '#d8ecd5',
    shellShadow: '10px 0 34px rgba(74, 103, 74, 0.12)',
    panelShadow: '0 16px 34px rgba(74, 103, 74, 0.12)',
    cardShadow: '0 8px 18px rgba(74, 103, 74, 0.1)',
  },
  {
    id: 'dusk',
    label: 'Dusk',
    swatch: '#8b5cf6',
    bg: '#e8e0f3',
    sidebar: '#f9f6fd',
    border: '#ddd0ef',
    card: '#faf7fd',
    cardBg: '#f2eef8',
    text: '#2d1b4e',
    sub: '#9e82c0',
    accent: '#6d28d9',
    pill: '#ede9fe',
    shellShadow: '10px 0 34px rgba(97, 66, 145, 0.14)',
    panelShadow: '0 16px 34px rgba(97, 66, 145, 0.14)',
    cardShadow: '0 8px 18px rgba(97, 66, 145, 0.12)',
  },
  {
    id: 'oscuro',
    label: 'Oscuro',
    swatch: '#4b5563',
    bg: '#090b10',
    sidebar: '#13151f',
    border: '#1e2030',
    card: '#1a1d27',
    cardBg: '#13151f',
    text: '#e8e8e8',
    sub: '#6b7280',
    accent: '#818cf8',
    pill: '#1e2535',
    shellShadow: '10px 0 34px rgba(0, 0, 0, 0.45)',
    panelShadow: '0 16px 34px rgba(0, 0, 0, 0.45)',
    cardShadow: '0 8px 18px rgba(0, 0, 0, 0.35)',
  },
]

const INITIAL_COLS: BoardColumn[] = [
  { id: 'pendiente', label: 'Pendiente', dot: '#f59e0b' },
  { id: 'progreso', label: 'En progreso', dot: '#3b82f6' },
  { id: 'completado', label: 'Completado', dot: '#22c55e' },
]

const INITIAL_TASKS: BoardTask[] = [
  {
    id: 1,
    title: 'Revisar propuesta de diseno',
    colId: 'progreso',
    priority: 'Alta',
    tag: 'Diseno',
    due: '22 jul',
    assignee: 'AG',
  },
  {
    id: 2,
    title: 'Reunion con equipo de producto',
    colId: 'pendiente',
    priority: 'Media',
    tag: 'Reunion',
    due: '23 jul',
    assignee: 'LT',
  },
  {
    id: 3,
    title: 'Documentar API de autenticacion',
    colId: 'completado',
    priority: 'Alta',
    tag: 'Desarrollo',
    due: '20 jul',
    assignee: 'ML',
  },
  {
    id: 4,
    title: 'Actualizar dependencias npm',
    colId: 'pendiente',
    priority: 'Baja',
    tag: 'Desarrollo',
    due: '25 jul',
    assignee: 'CR',
  },
  {
    id: 5,
    title: 'Redactar informe Q2',
    colId: 'progreso',
    priority: 'Alta',
    tag: 'Finanzas',
    due: '24 jul',
    assignee: 'SD',
  },
  {
    id: 6,
    title: 'Revision de codigo PR #48',
    colId: 'pendiente',
    priority: 'Media',
    tag: 'Desarrollo',
    due: '22 jul',
    assignee: 'AG',
  },
  {
    id: 7,
    title: 'Configurar entorno de staging',
    colId: 'completado',
    priority: 'Alta',
    tag: 'DevOps',
    due: '19 jul',
    assignee: 'LT',
  },
  {
    id: 8,
    title: 'Entrevista candidato frontend',
    colId: 'pendiente',
    priority: 'Media',
    tag: 'RRHH',
    due: '26 jul',
    assignee: 'ML',
  },
]

const PAGES: NavigationItem[] = [
  { label: 'Inicio', icon: HomeIcon },
  { label: 'Mis tareas', icon: ClipboardDocumentListIcon },
  { label: 'Proyectos', icon: FolderIcon },
  { label: 'Calendario', icon: CalendarDaysIcon },
  { label: 'Archivo', icon: ArchiveBoxIcon },
]

const PRIORITY_STYLE: Record<TaskPriority, { bg: string; color: string }> = {
  Alta: { bg: '#fff1f2', color: '#be123c' },
  Media: { bg: '#fffbeb', color: '#b45309' },
  Baja: { bg: '#f0fdf4', color: '#15803d' },
}

const TAG_COLORS: Record<string, string> = {
  Diseno: '#e0e7ff',
  Reunion: '#fce7f3',
  Desarrollo: '#dbeafe',
  Finanzas: '#d1fae5',
  DevOps: '#fef3c7',
  RRHH: '#ede9fe',
  General: '#f5f5f4',
}

const AVATAR_COLORS: Record<string, string> = {
  AG: '#6366f1',
  LT: '#0ea5e9',
  ML: '#ec4899',
  CR: '#10b981',
  SD: '#f59e0b',
}

const DOT_PRESETS = [
  '#f59e0b',
  '#3b82f6',
  '#22c55e',
  '#ec4899',
  '#8b5cf6',
  '#ef4444',
  '#14b8a6',
]

let nextId = 100

export default function DashboardPage() {
  const [activePage, setActivePage] = useState('Mis tareas')
  const [collapsed, setCollapsed] = useState(false)
  const [view, setView] = useState<ViewMode>('kanban')
  const [themeId, setThemeId] = useState('crema')
  const [showThemes, setShowThemes] = useState(false)
  const [cols, setCols] = useState<BoardColumn[]>(INITIAL_COLS)
  const [tasks, setTasks] = useState<BoardTask[]>(INITIAL_TASKS)
  const [adding, setAdding] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [editingCol, setEditingCol] = useState<string | null>(null)
  const [editingColLabel, setEditingColLabel] = useState('')
  const [addingCol, setAddingCol] = useState(false)
  const [newColLabel, setNewColLabel] = useState('')
  const [newColDot, setNewColDot] = useState(DOT_PRESETS[0])
  const [editingTask, setEditingTask] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [filter, setFilter] = useState<'Todas' | TaskPriority>('Todas')

  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0]

  const addTask = (colId: string) => {
    if (!newTaskTitle.trim()) {
      setAdding(null)
      return
    }

    setTasks((current) => [
      ...current,
      {
        id: nextId++,
        title: newTaskTitle,
        colId,
        priority: 'Media',
        tag: 'General',
        due: '—',
        assignee: 'AG',
      },
    ])

    setNewTaskTitle('')
    setAdding(null)
  }

  const deleteTask = (id: number) =>
    setTasks((current) => current.filter((task) => task.id !== id))

  const saveTaskTitle = (id: number) => {
    if (editingTitle.trim()) {
      setTasks((current) =>
        current.map((task) =>
          task.id === id ? { ...task, title: editingTitle } : task,
        ),
      )
    }

    setEditingTask(null)
  }

  const saveColLabel = (id: string) => {
    if (editingColLabel.trim()) {
      setCols((current) =>
        current.map((col) =>
          col.id === id ? { ...col, label: editingColLabel } : col,
        ),
      )
    }

    setEditingCol(null)
  }

  const deleteCol = (id: string) => {
    setCols((current) => current.filter((col) => col.id !== id))
    setTasks((current) => current.filter((task) => task.colId !== id))
  }

  const addCol = () => {
    if (!newColLabel.trim()) {
      setAddingCol(false)
      return
    }

    const id = `${newColLabel.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`

    setCols((current) => [...current, { id, label: newColLabel, dot: newColDot }])
    setNewColLabel('')
    setAddingCol(false)
  }

  const visibleTasks = (colId: string) => {
    const all = tasks.filter((task) => task.colId === colId)
    return filter === 'Todas'
      ? all
      : all.filter((task) => task.priority === filter)
  }

  const pill = (bg: string, color: string, text: string) => (
    <span
      style={{
        background: bg,
        color,
        borderRadius: 5,
        padding: '0.12rem 0.45rem',
        fontSize: '0.68rem',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  )

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: "'Lora', Georgia, serif",
        background: theme.bg,
        color: theme.text,
        overflow: 'hidden',
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Lora:opsz,wght@6..72,400;6..72,500;6..72,600&family=EB+Garamond:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <aside
        style={{
          width: collapsed ? 56 : 220,
          background: theme.sidebar,
          borderRight: `1px solid ${theme.border}`,
          padding: collapsed ? '1.5rem 0.6rem' : '1.5rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem',
          flexShrink: 0,
          transition: 'width 0.22s ease',
          overflow: 'hidden',
          boxShadow: theme.shellShadow,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            marginBottom: '1.5rem',
            paddingLeft: collapsed ? 0 : '0.3rem',
          }}
        >
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  background: theme.accent,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <RectangleStackIcon
                  style={{ width: 14, height: 14, color: theme.sidebar }}
                />
              </div>
              <span
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: theme.text,
                }}
              >
                TaskFlow
              </span>
            </div>
          )}

          <button
            onClick={() => setCollapsed((current) => !current)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme.sub,
              padding: '0.2rem',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label={collapsed ? 'Expandir menu' : 'Contraer menu'}
          >
            {collapsed ? (
              <ChevronRightIcon style={{ width: 16, height: 16 }} />
            ) : (
              <ChevronLeftIcon style={{ width: 16, height: 16 }} />
            )}
          </button>
        </div>

        {PAGES.map((page) => {
          const Icon = page.icon

          return (
            <button
              key={page.label}
              onClick={() => setActivePage(page.label)}
              title={page.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: activePage === page.label ? theme.pill : 'transparent',
                border: 'none',
                borderRadius: 6,
                padding: collapsed ? '0.5rem' : '0.45rem 0.75rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: activePage === page.label ? theme.accent : theme.sub,
                fontSize: collapsed ? '1rem' : '0.84rem',
                fontFamily: "'Lora', serif",
                fontWeight: activePage === page.label ? 500 : 400,
                cursor: 'pointer',
                width: '100%',
                transition: 'background 0.12s',
              }}
            >
              <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
              {!collapsed && page.label}
            </button>
          )
        })}

        <div
          style={{
            marginTop: 'auto',
            borderTop: `1px solid ${theme.border}`,
            paddingTop: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: collapsed ? '0.5rem' : '0.6rem 0.75rem',
              borderRadius: 8,
              background: theme.bg,
              justifyContent: collapsed ? 'center' : 'flex-start',
              boxShadow: theme.cardShadow,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: theme.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.sidebar,
                fontSize: '0.72rem',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              AG
            </div>
            {!collapsed && (
              <div>
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    color: theme.text,
                  }}
                >
                  Ana Garcia
                </div>
                <div style={{ fontSize: '0.7rem', color: theme.sub }}>
                  Administrador
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2.25rem 2.75rem',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '1.75rem',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.7rem',
                color: theme.sub,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                marginBottom: '0.3rem',
              }}
            >
              Sprint · Julio 2025
            </div>
            <h1
              style={{
                fontFamily: "'EB Garamond', serif",
                fontSize: '2.1rem',
                fontWeight: 600,
                margin: 0,
                letterSpacing: '-0.02em',
                color: theme.text,
              }}
            >
              Mis tareas
            </h1>
          </div>

          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}
          >
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as 'Todas' | TaskPriority)}
              style={{
                border: `1px solid ${theme.border}`,
                borderRadius: 7,
                padding: '0.38rem 0.75rem',
                fontSize: '0.8rem',
                fontFamily: "'Lora', serif",
                color: theme.sub,
                background: theme.card,
                cursor: 'pointer',
                outline: 'none',
                boxShadow: theme.cardShadow,
              }}
            >
              {['Todas', 'Alta', 'Media', 'Baja'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <div
              style={{
                display: 'flex',
                background: theme.pill,
                borderRadius: 8,
                padding: 3,
                boxShadow: theme.cardShadow,
              }}
            >
              {(['kanban', 'lista'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  style={{
                    background: view === mode ? theme.card : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.3rem 0.9rem',
                    fontSize: '0.78rem',
                    color: view === mode ? theme.text : theme.sub,
                    fontFamily: "'Lora', serif",
                    cursor: 'pointer',
                    boxShadow: view === mode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    fontWeight: view === mode ? 500 : 400,
                    textTransform: 'capitalize',
                    transition: 'all 0.15s',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowThemes((current) => !current)}
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  padding: '0.38rem 0.85rem',
                  fontSize: '0.8rem',
                  fontFamily: "'Lora', serif",
                  color: theme.text,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: theme.cardShadow,
                }}
              >
                <PaintBrushIcon style={{ width: 15, height: 15 }} />
                <span style={{ color: theme.sub }}>Tema</span>
              </button>

              {showThemes && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 12,
                    padding: '0.6rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    zIndex: 100,
                    boxShadow: theme.panelShadow,
                    minWidth: 150,
                  }}
                >
                  {THEMES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setThemeId(item.id)
                        setShowThemes(false)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        background: themeId === item.id ? theme.pill : 'transparent',
                        border: 'none',
                        borderRadius: 7,
                        padding: '0.45rem 0.75rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: "'Lora', serif",
                        fontSize: '0.84rem',
                        color: theme.text,
                        fontWeight: themeId === item.id ? 600 : 400,
                        transition: 'background 0.1s',
                      }}
                    >
                      <SwatchIcon style={{ width: 15, height: 15 }} />
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '999px',
                          background: item.swatch,
                          flexShrink: 0,
                        }}
                      />
                      {item.label}
                      {themeId === item.id && (
                        <CheckIcon
                          style={{ marginLeft: 'auto', width: 14, height: 14, color: theme.accent }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {view === 'kanban' && (
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                overflowX: 'auto',
                paddingBottom: '1rem',
                flex: 1,
                paddingTop: '0.2rem',
              }}
            >
            {cols.map((col) => {
              const colTasks = visibleTasks(col.id)

              return (
                <div
                  key={col.id}
                  style={{
                    background: theme.card,
                    borderRadius: 13,
                    border: `1px solid ${theme.border}`,
                    minWidth: 265,
                    width: 275,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: theme.panelShadow,
                  }}
                >
                  <div
                    style={{
                      padding: '0.9rem 1rem 0.75rem',
                      borderBottom: `1px solid ${theme.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: '50%',
                          background: col.dot,
                          flexShrink: 0,
                        }}
                      />

                      {editingCol === col.id ? (
                        <input
                          autoFocus
                          value={editingColLabel}
                          onChange={(event) => setEditingColLabel(event.target.value)}
                          onBlur={() => saveColLabel(col.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              saveColLabel(col.id)
                            }
                            if (event.key === 'Escape') {
                              setEditingCol(null)
                            }
                          }}
                          style={{
                            border: 'none',
                            borderBottom: `1px solid ${theme.border}`,
                            outline: 'none',
                            fontSize: '0.88rem',
                            fontFamily: "'EB Garamond', serif",
                            fontWeight: 600,
                            color: theme.text,
                            background: 'transparent',
                            width: '100%',
                          }}
                        />
                      ) : (
                        <span
                          onDoubleClick={() => {
                            setEditingCol(col.id)
                            setEditingColLabel(col.label)
                          }}
                          title="Doble clic para editar"
                          style={{
                            fontFamily: "'EB Garamond', serif",
                            fontWeight: 600,
                            fontSize: '0.92rem',
                            color: theme.text,
                            cursor: 'text',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {col.label}
                        </span>
                      )}

                      <span
                        style={{
                          background: theme.pill,
                          borderRadius: 99,
                          padding: '0.1rem 0.5rem',
                          fontSize: '0.7rem',
                          color: theme.sub,
                          flexShrink: 0,
                        }}
                      >
                        {colTasks.length}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '0.3rem',
                        alignItems: 'center',
                        flexShrink: 0,
                        marginLeft: '0.5rem',
                      }}
                    >
                      {DOT_PRESETS.map((dot) => (
                        <div
                          key={dot}
                          onClick={() =>
                            setCols((current) =>
                              current.map((item) =>
                                item.id === col.id ? { ...item, dot } : item,
                              ),
                            )
                          }
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: dot,
                            cursor: 'pointer',
                            opacity: col.dot === dot ? 1 : 0.3,
                            transition: 'opacity 0.15s',
                          }}
                        />
                      ))}

                      <button
                        onClick={() => deleteCol(col.id)}
                        title="Eliminar columna"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme.sub,
                          cursor: 'pointer',
                          marginLeft: 4,
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        aria-label="Eliminar columna"
                      >
                        <XMarkIcon style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                      flex: 1,
                    }}
                  >
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        style={{
                          background: theme.cardBg,
                          borderRadius: 9,
                          padding: '0.85rem 0.9rem',
                          border: `1px solid ${theme.border}`,
                          transition: 'box-shadow 0.15s',
                          boxShadow: theme.cardShadow,
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.boxShadow =
                            theme.panelShadow
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.boxShadow = theme.cardShadow
                        }}
                      >
                        {editingTask === task.id ? (
                          <input
                            autoFocus
                            value={editingTitle}
                            onChange={(event) => setEditingTitle(event.target.value)}
                            onBlur={() => saveTaskTitle(task.id)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                saveTaskTitle(task.id)
                              }
                              if (event.key === 'Escape') {
                                setEditingTask(null)
                              }
                            }}
                            style={{
                              border: 'none',
                              borderBottom: `1px solid ${theme.border}`,
                              outline: 'none',
                              width: '100%',
                              fontSize: '0.86rem',
                              fontFamily: "'Lora', serif",
                              background: 'transparent',
                              marginBottom: '0.5rem',
                              color: theme.text,
                            }}
                          />
                        ) : (
                          <div
                            onDoubleClick={() => {
                              setEditingTask(task.id)
                              setEditingTitle(task.title)
                            }}
                            title="Doble clic para editar"
                            style={{
                              fontSize: '0.86rem',
                              color: theme.text,
                              marginBottom: '0.6rem',
                              lineHeight: 1.4,
                              cursor: 'text',
                            }}
                          >
                            {task.title}
                          </div>
                        )}

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {pill(TAG_COLORS[task.tag] || '#f5f5f4', '#44403c', task.tag)}
                            {pill(
                              PRIORITY_STYLE[task.priority].bg,
                              PRIORITY_STYLE[task.priority].color,
                              task.priority,
                            )}
                          </div>
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <span style={{ fontSize: '0.68rem', color: theme.sub }}>
                              {task.due}
                            </span>
                            <div
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                background: AVATAR_COLORS[task.assignee] || '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '0.55rem',
                                fontWeight: 600,
                              }}
                            >
                              {task.assignee}
                            </div>
                            <button
                              onClick={() => deleteTask(task.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: theme.sub,
                                cursor: 'pointer',
                                padding: 0,
                                lineHeight: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              aria-label="Eliminar tarea"
                            >
                              <XMarkIcon style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {adding === col.id ? (
                      <div
                        style={{
                          background: theme.card,
                          borderRadius: 9,
                          padding: '0.75rem 0.9rem',
                          border: `1px dashed ${theme.border}`,
                          boxShadow: theme.cardShadow,
                        }}
                      >
                        <input
                          autoFocus
                          value={newTaskTitle}
                          onChange={(event) => setNewTaskTitle(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              addTask(col.id)
                            }
                            if (event.key === 'Escape') {
                              setAdding(null)
                              setNewTaskTitle('')
                            }
                          }}
                          placeholder="Nombre de la tarea..."
                          style={{
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            fontSize: '0.84rem',
                            fontFamily: "'Lora', serif",
                            background: 'transparent',
                            marginBottom: '0.5rem',
                            color: theme.text,
                          }}
                        />
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => addTask(col.id)}
                            style={{
                              background: theme.accent,
                              color: theme.sidebar,
                              border: 'none',
                              borderRadius: 6,
                              padding: '0.28rem 0.75rem',
                              fontSize: '0.75rem',
                              fontFamily: "'Lora', serif",
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <PlusIcon style={{ width: 14, height: 14 }} />
                            Anadir
                          </button>
                          <button
                            onClick={() => {
                              setAdding(null)
                              setNewTaskTitle('')
                            }}
                            style={{
                              background: 'none',
                              border: `1px solid ${theme.border}`,
                              borderRadius: 6,
                              padding: '0.28rem 0.6rem',
                              fontSize: '0.75rem',
                              fontFamily: "'Lora', serif",
                              cursor: 'pointer',
                              color: theme.sub,
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAdding(col.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme.sub,
                          fontSize: '0.82rem',
                          fontFamily: "'Lora', serif",
                          cursor: 'pointer',
                          textAlign: 'left',
                          padding: '0.3rem 0.1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <PlusIcon style={{ width: 15, height: 15 }} />
                        Nueva tarea
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {addingCol ? (
              <div
                style={{
                  background: theme.card,
                  borderRadius: 13,
                  border: `1px dashed ${theme.border}`,
                  minWidth: 240,
                  padding: '1rem',
                  flexShrink: 0,
                  boxShadow: theme.panelShadow,
                }}
              >
                <input
                  autoFocus
                  value={newColLabel}
                  onChange={(event) => setNewColLabel(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      addCol()
                    }
                    if (event.key === 'Escape') {
                      setAddingCol(false)
                    }
                  }}
                  placeholder="Nombre del estado..."
                  style={{
                    border: 'none',
                    borderBottom: `1px solid ${theme.border}`,
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.88rem',
                    fontFamily: "'EB Garamond', serif",
                    background: 'transparent',
                    marginBottom: '0.75rem',
                    color: theme.text,
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    gap: '0.4rem',
                    marginBottom: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {DOT_PRESETS.map((dot) => (
                    <div
                      key={dot}
                      onClick={() => setNewColDot(dot)}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: dot,
                        cursor: 'pointer',
                        border:
                          newColDot === dot
                            ? `2px solid ${theme.text}`
                            : '2px solid transparent',
                        transition: 'border 0.15s',
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={addCol}
                    style={{
                      background: theme.accent,
                      color: theme.sidebar,
                      border: 'none',
                      borderRadius: 6,
                      padding: '0.3rem 0.85rem',
                      fontSize: '0.78rem',
                      fontFamily: "'Lora', serif",
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <PlusIcon style={{ width: 14, height: 14 }} />
                    Crear
                  </button>
                  <button
                    onClick={() => setAddingCol(false)}
                    style={{
                      background: 'none',
                      border: `1px solid ${theme.border}`,
                      borderRadius: 6,
                      padding: '0.3rem 0.7rem',
                      fontSize: '0.78rem',
                      fontFamily: "'Lora', serif",
                      cursor: 'pointer',
                      color: theme.sub,
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingCol(true)}
                style={{
                  background: 'none',
                  border: `1px dashed ${theme.border}`,
                  borderRadius: 13,
                  minWidth: 200,
                  padding: '1rem',
                  color: theme.sub,
                  fontSize: '0.84rem',
                  fontFamily: "'Lora', serif",
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'border-color 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  boxShadow: theme.cardShadow,
                }}
              >
                <PlusIcon style={{ width: 15, height: 15 }} />
                Nuevo estado
              </button>
            )}
          </div>
        )}

        {view === 'lista' && (
          <div
            style={{
              background: theme.card,
              borderRadius: 12,
              border: `1px solid ${theme.border}`,
              overflow: 'hidden',
              boxShadow: theme.panelShadow,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 80px 60px',
                gap: '1rem',
                padding: '0.7rem 1.25rem',
                borderBottom: `1px solid ${theme.border}`,
                background: theme.cardBg,
              }}
            >
              {['Tarea', 'Estado', 'Prioridad', 'Etiqueta', 'Fecha', ''].map((heading) => (
                <div
                  key={heading}
                  style={{
                    fontSize: '0.7rem',
                    color: theme.sub,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}
                >
                  {heading}
                </div>
              ))}
            </div>

            {tasks
              .filter((task) => filter === 'Todas' || task.priority === filter)
              .map((task, index, arr) => {
                const col = cols.find((item) => item.id === task.colId)

                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 80px 60px',
                      gap: '1rem',
                      padding: '0.8rem 1.25rem',
                      borderBottom:
                        index < arr.length - 1 ? `1px solid ${theme.border}` : 'none',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.87rem', color: theme.text }}>
                      {task.title}
                    </span>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: theme.pill,
                        borderRadius: 6,
                        padding: '0.18rem 0.5rem',
                        width: 'fit-content',
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: col?.dot || '#94a3b8',
                        }}
                      />
                      <span style={{ fontSize: '0.74rem', color: theme.sub }}>
                        {col?.label || task.colId}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        background: PRIORITY_STYLE[task.priority].bg,
                        borderRadius: 6,
                        padding: '0.18rem 0.5rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: PRIORITY_STYLE[task.priority].color,
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        background: TAG_COLORS[task.tag] || theme.pill,
                        borderRadius: 6,
                        padding: '0.18rem 0.5rem',
                      }}
                    >
                      <span style={{ fontSize: '0.74rem', color: '#44403c' }}>
                        {task.tag}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.77rem', color: theme.sub }}>{task.due}</span>

                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: AVATAR_COLORS[task.assignee] || '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '0.58rem',
                          fontWeight: 600,
                        }}
                      >
                        {task.assignee}
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme.sub,
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        aria-label="Eliminar tarea"
                      >
                        <XMarkIcon style={{ width: 15, height: 15 }} />
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </main>
    </div>
  )
}
