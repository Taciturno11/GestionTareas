import {
  ArchiveBoxIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  HomeIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  BellIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'

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

interface BoardColumn {
  id: string
  label: string
  emoji: string
  color: string
  bgColor: string
}

const INITIAL_COLS: BoardColumn[] = [
  { id: 'pendiente', label: 'Pendiente', emoji: '⏳', color: 'bg-amber-100 text-amber-900', bgColor: 'bg-amber-50/60' },
  { id: 'progreso', label: 'En progreso', emoji: '🚀', color: 'bg-blue-100 text-blue-900', bgColor: 'bg-blue-50/80' },
  { id: 'completado', label: 'Completado', emoji: '✅', color: 'bg-emerald-100 text-emerald-900', bgColor: 'bg-emerald-50/80' },
]

const INITIAL_TASKS: BoardTask[] = [
  { id: 1, title: 'Revisar propuesta de diseño', colId: 'progreso', priority: 'Alta', tag: 'Diseño', due: '22 jul', assignee: 'AG' },
  { id: 2, title: 'Reunión con equipo de producto', colId: 'pendiente', priority: 'Media', tag: 'Reunión', due: '23 jul', assignee: 'LT' },
  { id: 3, title: 'Documentar API de autenticación', colId: 'completado', priority: 'Alta', tag: 'Desarrollo', due: '20 jul', assignee: 'ML' },
  { id: 4, title: 'Actualizar dependencias npm', colId: 'pendiente', priority: 'Baja', tag: 'Desarrollo', due: '25 jul', assignee: 'CR' },
  { id: 5, title: 'Redactar informe Q2', colId: 'progreso', priority: 'Alta', tag: 'Finanzas', due: '24 jul', assignee: 'SD' },
]

const NAVIGATION = [
  { label: 'Inicio', icon: HomeIcon, emoji: '🏠' },
  { label: 'Mis tareas', icon: ClipboardDocumentListIcon, emoji: '📋', active: true },
  { label: 'Proyectos', icon: FolderIcon, emoji: '📁' },
  { label: 'Calendario', icon: CalendarDaysIcon, emoji: '🗓️' },
  { label: 'Archivo', icon: ArchiveBoxIcon, emoji: '📦' },
]

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [view, setView] = useState<ViewMode>('kanban')
  const [tasks, setTasks] = useState<BoardTask[]>(INITIAL_TASKS)
  const [cols, setCols] = useState<BoardColumn[]>(INITIAL_COLS)
  const [addingToCol, setAddingToCol] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const addTask = (colId: string) => {
    if (!newTaskTitle.trim()) {
      setAddingToCol(null)
      return
    }
    const newTask: BoardTask = {
      id: Date.now(),
      title: newTaskTitle,
      colId,
      priority: 'Media',
      tag: 'General',
      due: '—',
      assignee: 'AG',
    }
    setTasks([...tasks, newTask])
    setNewTaskTitle('')
    setAddingToCol(null)
  }

  const deleteCol = (id: string) => {
    setCols(cols.filter(c => c.id !== id))
    setTasks(tasks.filter(t => t.colId !== id))
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans text-[14px]">
      {/* Sidebar - Notion Style */}
      <aside className={`flex flex-col bg-[#fbfbfa] border-r border-slate-200/60 transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-64'}`}>
        <div className="flex items-center gap-2 p-4 hover:bg-slate-200/50 cursor-pointer transition-colors group">
          <div className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center text-white text-[10px] font-bold">AG</div>
          <span className="font-medium text-slate-700 truncate">Workspace de Ana</span>
        </div>

        <div className="px-2 mt-2 space-y-0.5">
          <div className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:bg-slate-200/50 rounded cursor-pointer group">
            <MagnifyingGlassIcon className="h-4 w-4" />
            <span>Buscar</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:bg-slate-200/50 rounded cursor-pointer">
            <BellIcon className="h-4 w-4" />
            <span>Notificaciones</span>
          </div>
        </div>

        <nav className="flex-1 px-2 mt-6 space-y-0.5">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Favoritos</div>
          {NAVIGATION.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors ${
                item.active ? 'bg-slate-200/60 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200/60">
          <div className="flex items-center gap-2 px-2 py-1.5 text-slate-500 hover:bg-slate-200/50 rounded cursor-pointer">
            <PlusIcon className="h-4 w-4" />
            <span>Nueva página</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white z-10">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors"
            >
              <ChevronRightIcon className={`h-4 w-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
            </button>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span>📋</span>
              <span className="hover:underline cursor-pointer">Mis tareas</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="text-xs">Editado hace 2 min</span>
            <span className="hover:text-slate-600 cursor-pointer text-sm font-medium">Compartir</span>
            <EllipsisHorizontalIcon className="h-5 w-5 hover:text-slate-600 cursor-pointer" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full px-10 pt-16 pb-20">
            <div className="flex items-end justify-between mb-10 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl">📋</span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Mis tareas</h1>
              </div>

              {/* View Toggle - Notion Style Switch */}
              <div className="flex bg-slate-100/80 p-1 rounded-lg">
                <button 
                  onClick={() => setView('kanban')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'kanban' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <span>📦</span> Kanban
                </button>
                <button 
                  onClick={() => setView('lista')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${view === 'lista' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <span>📄</span> Lista
                </button>
              </div>
            </div>

            {/* Board View */}
            {view === 'kanban' && (
              <div className="flex gap-6 items-start overflow-x-auto pb-8 w-full">
                {cols.map((col) => (
                  <div key={col.id} className={`w-[320px] shrink-0 group/col rounded-xl p-4 border border-slate-200/60 shadow-sm transition-shadow hover:shadow-md ${col.bgColor}`}>
                    <div className="flex items-center justify-between px-1 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${col.color}`}>
                          {col.emoji} {col.label}
                        </span>
                        <span className="text-slate-400 text-xs font-bold">{tasks.filter(t => t.colId === col.id).length}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/col:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setAddingToCol(col.id)}
                          className="p-1 hover:bg-white/60 rounded text-slate-400 transition-colors"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => deleteCol(col.id)}
                          className="p-1 hover:bg-white/60 rounded text-slate-400 transition-colors"
                        >
                          <EllipsisHorizontalIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {tasks.filter(t => t.colId === col.id).map((task) => (
                        <div 
                          key={task.id}
                          className="bg-white notion-shadow rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group/card active:scale-[0.98]"
                        >
                          <h4 className="text-slate-800 font-medium mb-3 leading-snug">{task.title}</h4>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">
                              {task.tag}
                            </span>
                            {task.priority === 'Alta' && (
                              <span className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                                High
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto font-medium">
                              <span>{task.due}</span>
                              <div className="h-5 w-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] text-slate-600 font-bold">
                                {task.assignee}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {addingToCol === col.id ? (
                        <div className="bg-white notion-shadow rounded-lg p-3">
                          <textarea
                            autoFocus
                            placeholder="¿Qué hay que hacer?"
                            className="w-full text-sm outline-none resize-none bg-transparent"
                            rows={2}
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addTask(col.id)
                              }
                              if (e.key === 'Escape') setAddingToCol(null)
                            }}
                            onBlur={() => addTask(col.id)}
                          />
                        </div>
                      ) : (
                        <button 
                          onClick={() => setAddingToCol(col.id)}
                          className="flex items-center gap-2 w-full px-2 py-2 text-slate-400 hover:bg-white/60 rounded-lg transition-colors text-xs font-semibold"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                          <span>Añadir tarea</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button 
                  className="w-[320px] shrink-0 flex items-center justify-center h-12 text-slate-300 hover:text-slate-500 hover:bg-slate-50 border border-dashed border-slate-200 rounded-xl transition-all group font-bold text-xs uppercase tracking-widest"
                  onClick={() => {
                    const label = prompt('Nombre del nuevo estado:')
                    if (label) {
                      setCols([...cols, { 
                        id: label.toLowerCase().replace(/\s+/g, '_'), 
                        label, 
                        emoji: '📄', 
                        color: 'bg-slate-100 text-slate-800',
                        bgColor: 'bg-slate-50/50'
                      }])
                    }
                  }}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Añadir otro grupo
                </button>
              </div>
            )}

            {/* List View */}
            {view === 'lista' && (
              <div className="border border-slate-200/60 rounded-lg overflow-hidden w-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3 text-left">Tarea</th>
                      <th className="px-6 py-3 text-left">Estado</th>
                      <th className="px-6 py-3 text-left">Prioridad</th>
                      <th className="px-6 py-3 text-left">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50/50 cursor-pointer transition-colors group">
                        <td className="px-6 py-4 text-slate-800 font-medium">{task.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cols.find(c => c.id === task.colId)?.color || 'bg-slate-100'}`}>
                            {cols.find(c => c.id === task.colId)?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${task.priority === 'Alta' ? 'bg-rose-50 text-rose-600' : 'text-slate-400'}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-[12px] font-medium">{task.due}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Help */}
        <div className="absolute bottom-4 right-4">
          <div className="h-8 w-8 rounded-full notion-shadow bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer shadow-lg">
            <QuestionMarkCircleIcon className="h-5 w-5" />
          </div>
        </div>
      </main>
    </div>
  )
}
