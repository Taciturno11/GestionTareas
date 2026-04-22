import {
  PlusIcon,
  EllipsisHorizontalIcon,
  QuestionMarkCircleIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline'
import { Squares2X2Icon, TableCellsIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

/* ─────────────────────── Types ─────────────────────── */
type TaskPriority = 'Alta' | 'Media' | 'Baja'
type ViewMode = 'board' | 'table'

interface BoardTask {
  id: number
  title: string
  colId: string
  priority: TaskPriority
  tag: string
  due: string
  assignee: string
  workspaceId: string
}

interface BoardColumn {
  id: string
  label: string
  dot: string   // Tailwind bg color class for the dot
}

/* ─────────────────────── Data ─────────────────────── */

const COLS: BoardColumn[] = [
  { id: 'pendiente',  label: 'Pendiente',   dot: '#F59E0B' },
  { id: 'progreso',   label: 'En Progreso', dot: '#3B82F6' },
  { id: 'completado', label: 'Completado',  dot: '#10B981' },
]

const TASKS: BoardTask[] = [
  { id: 1, title: 'Revisar propuesta de diseño',     colId: 'progreso',   priority: 'Alta',  tag: 'Diseño',     due: '22 jul', assignee: 'AG', workspaceId: 'job-1' },
  { id: 2, title: 'Reunión con equipo de producto',  colId: 'pendiente',  priority: 'Media', tag: 'Reunión',    due: '23 jul', assignee: 'LT', workspaceId: 'job-1' },
  { id: 3, title: 'Documentar API de autenticación', colId: 'completado', priority: 'Alta',  tag: 'Desarrollo', due: '20 jul', assignee: 'ML', workspaceId: 'job-1' },
  { id: 4, title: 'Actualizar dependencias npm',     colId: 'pendiente',  priority: 'Baja',  tag: 'Desarrollo', due: '25 jul', assignee: 'CR', workspaceId: 'job-2' },
  { id: 5, title: 'Redactar informe Q2',             colId: 'progreso',   priority: 'Alta',  tag: 'Finanzas',   due: '24 jul', assignee: 'SD', workspaceId: 'job-2' },
]

// Tag colors — pastel pills exactamente como Notion
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Diseño:     { bg: '#DBEAFE', text: '#1D4ED8' },
  Reunión:    { bg: '#EDE9FE', text: '#5B21B6' },
  Desarrollo: { bg: '#D1FAE5', text: '#065F46' },
  Finanzas:   { bg: '#FEF3C7', text: '#92400E' },
  General:    { bg: '#F3F4F6', text: '#374151' },
}

const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string }> = {
  Alta:  { bg: '#FEE2E2', text: '#B91C1C' },
  Media: { bg: '#FEF3C7', text: '#92400E' },
  Baja:  { bg: '#F1F5F9', text: '#64748B' },
}

const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
  AG: { bg: '#EDE9FE', text: '#5B21B6' },
  LT: { bg: '#DBEAFE', text: '#1D4ED8' },
  ML: { bg: '#D1FAE5', text: '#065F46' },
  CR: { bg: '#FFE4E6', text: '#9F1239' },
  SD: { bg: '#FEF9C3', text: '#713F12' },
}

/* ─────────────────────── Component ─────────────────────── */
export default function DashboardPage() {
  const location = useLocation()
  const currentWorkspace = new URLSearchParams(location.search).get('w')

  const [view, setView]                   = useState<ViewMode>('board')
  const [tasks, setTasks]                 = useState<BoardTask[]>(TASKS)
  const [cols, setCols]                   = useState<BoardColumn[]>(COLS)
  const [addingToCol, setAddingToCol]     = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle]   = useState('')

  const filteredTasks = currentWorkspace ? tasks.filter(t => t.workspaceId === currentWorkspace) : tasks

  const addTask = (colId: string) => {
    if (!newTaskTitle.trim()) { setAddingToCol(null); return }
    setTasks(prev => [...prev, {
      id: Date.now(), title: newTaskTitle.trim(), colId,
      priority: 'Media', tag: 'General', due: '—', assignee: 'AG',
      workspaceId: currentWorkspace || 'job-1'
    }])
    setNewTaskTitle('')
    setAddingToCol(null)
  }

  const removeCol = (id: string) => {
    setCols(prev => prev.filter(c => c.id !== id))
    setTasks(prev => prev.filter(t => t.colId !== id))
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#F7F6F3' }}>

      {/* ─── Page top bar (Notion-style) ─── */}
      <div className="px-10 pt-8">

        {/* Title row */}
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">
            {currentWorkspace === 'job-1' ? 'Trabajo 1' : currentWorkspace === 'job-2' ? 'Trabajo 2' : 'Todas mis tareas'}
          </h1>

          {/* Right icons */}
          <div className="flex items-center gap-2 text-gray-400">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium hover:bg-gray-100 transition-colors">
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              Filtrar
            </button>
            <div className="w-px h-4 bg-gray-200" />
            <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
              <ListBulletIcon className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
              <TableCellsIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs — Board / Table */}
        <div className="flex items-center gap-0 border-b border-gray-200">
          {([
            { id: 'board', label: 'Board', Icon: Squares2X2Icon },
            { id: 'table', label: 'Table', Icon: TableCellsIcon },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium transition-colors relative"
              style={{
                color: view === id ? '#111827' : '#9CA3AF',
                borderBottom: view === id ? '2px solid #111827' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── BOARD VIEW ─── */}
      {view === 'board' && (
        <div className="flex-1 overflow-x-auto px-12 py-8">
          <div className="flex gap-10 items-start" style={{ minWidth: 'max-content' }}>

            {cols.map((col) => {
              const colTasks = filteredTasks.filter(t => t.colId === col.id)
              return (
                <div key={col.id} className="w-[330px] shrink-0 group/col">

                  {/* Column header — dot + label + count + actions */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {/* Colored dot */}
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ background: col.dot }}
                      />
                      {/* Label */}
                      <span className="text-[15px] font-semibold text-gray-800">
                        {col.label}
                      </span>
                      {/* Count */}
                      <span className="text-[14px] text-gray-400 font-medium">
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Actions — visible on hover */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover/col:opacity-100 transition-opacity">
                      <button
                        onClick={() => setAddingToCol(col.id)}
                        className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Añadir tarea"
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeCol(col.id)}
                        className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Opciones"
                      >
                        <EllipsisHorizontalIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Cards list */}
                  <div className="flex flex-col gap-2.5">
                    {colTasks.map((task) => {
                      const tagCfg  = TAG_COLORS[task.tag]  ?? TAG_COLORS['General']
                      const priCfg  = PRIORITY_COLORS[task.priority]
                      const aCfg    = AVATAR_COLORS[task.assignee] ?? { bg: '#F3F4F6', text: '#374151' }
                      return (
                        <div
                          key={task.id}
                          className="rounded-xl p-4 cursor-pointer transition-all duration-100 hover:shadow-md active:scale-[0.99]"
                          style={{
                            background: 'white',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB'
                            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)'
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'
                            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
                          }}
                        >
                          {/* Title */}
                          <p className="text-[13.5px] font-medium text-gray-800 leading-snug mb-2.5">
                            {task.title}
                          </p>

                          {/* Tags row */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Workspace pill - only in global view */}
                            {!currentWorkspace && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 uppercase tracking-wider">
                                {task.workspaceId === 'job-1' ? 'Trab. 1' : 'Trab. 2'}
                              </span>
                            )}
                            
                            {/* Tag pill */}
                            <span
                              className="text-[11px] font-semibold px-2 py-0.5 rounded"
                              style={{ background: tagCfg.bg, color: tagCfg.text }}
                            >
                              {task.tag}
                            </span>
                            {/* Priority pill */}
                            <span
                              className="text-[11px] font-semibold px-2 py-0.5 rounded"
                              style={{ background: priCfg.bg, color: priCfg.text }}
                            >
                              {task.priority}
                            </span>

                            {/* Spacer */}
                            <div className="flex-1" />

                            {/* Due date */}
                            {task.due !== '—' && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                                <CalendarIcon className="h-2.5 w-2.5" />
                                {task.due}
                              </span>
                            )}

                            {/* Avatar */}
                            <div
                              className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                              style={{ background: aCfg.bg, color: aCfg.text }}
                            >
                              {task.assignee}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Inline add task */}
                    {addingToCol === col.id ? (
                      <div
                        className="rounded-lg p-3"
                        style={{
                          background: 'white',
                          border: `1.5px solid ${col.dot}`,
                          boxShadow: `0 0 0 3px ${col.dot}18`,
                        }}
                      >
                        <textarea
                          autoFocus
                          placeholder="Título de la tarea…"
                          className="w-full text-[13px] text-gray-800 outline-none resize-none bg-transparent placeholder-gray-400"
                          rows={2}
                          value={newTaskTitle}
                          onChange={e => setNewTaskTitle(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { e.preventDefault(); addTask(col.id) }
                            if (e.key === 'Escape') setAddingToCol(null)
                          }}
                          onBlur={() => addTask(col.id)}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">↵ guardar · Esc cancelar</p>
                      </div>
                    ) : (
                      /* "+ Nuevo" button */
                      <button
                        onClick={() => setAddingToCol(col.id)}
                        className="flex items-center gap-1.5 px-1 py-1.5 text-[13px] text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                        Nuevo
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Add group */}
            <button
              className="shrink-0 flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-600 transition-colors py-0.5 whitespace-nowrap"
              onClick={() => {
                const label = prompt('Nombre del nuevo estado:')
                if (!label) return
                setCols(prev => [...prev, {
                  id: label.toLowerCase().replace(/\s+/g, '_'),
                  label,
                  dot: '#8B5CF6',
                }])
              }}
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Añadir grupo
            </button>
          </div>
        </div>
      )}

      {/* ─── TABLE VIEW ─── */}
      {view === 'table' && (
        <div className="px-10 py-6">
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Tarea', 'Estado', 'Prioridad', 'Etiqueta', 'Fecha', 'Asignado'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, i) => {
                  const col    = cols.find(c => c.id === task.colId)
                  const priCfg = PRIORITY_COLORS[task.priority]
                  const tagCfg = TAG_COLORS[task.tag] ?? TAG_COLORS['General']
                  const aCfg   = AVATAR_COLORS[task.assignee] ?? { bg: '#F3F4F6', text: '#374151' }
                  return (
                    <tr
                      key={task.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{
                        background: 'white',
                        borderBottom: i < tasks.length - 1 ? '1px solid #F3F4F6' : 'none',
                      }}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">{task.title}</td>
                      <td className="px-4 py-3">
                        {col && (
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gray-700">
                            <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: col.dot }} />
                            {col.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded"
                          style={{ background: priCfg.bg, color: priCfg.text }}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded"
                          style={{ background: tagCfg.bg, color: tagCfg.text }}
                        >
                          {task.tag}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-[12px]">{task.due}</td>
                      <td className="px-4 py-3">
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{ background: aCfg.bg, color: aCfg.text }}
                        >
                          {task.assignee}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Help FAB */}
      <div className="fixed bottom-6 right-6">
        <button
          className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
          style={{ border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          title="Ayuda"
        >
          <QuestionMarkCircleIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
