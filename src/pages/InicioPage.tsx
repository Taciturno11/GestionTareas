import { 
  ArrowRightIcon, 
  CalendarIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { HandRaisedIcon } from '@heroicons/react/24/solid'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { mockStats, mockProjects, mockActivity, mockUpcoming } from '../data/mockHome'
import { mockTasks } from '../data/mockTasks'

/* ── Helpers ── */
const AVATAR: Record<string, { bg: string; text: string }> = {
  MN: { bg: '#EDE9FE', text: '#5B21B6' },
  AL: { bg: '#DBEAFE', text: '#1D4ED8' },
  CR: { bg: '#FFE4E6', text: '#9F1239' },
  LT: { bg: '#D1FAE5', text: '#065F46' },
  AG: { bg: '#FEF9C3', text: '#713F12' },
}

const URGENCY_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  high:   { bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444' },
  medium: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  low:    { bg: '#F1F5F9', text: '#64748B', dot: '#9CA3AF' },
}

const PRIORITY_LABEL: Record<string, { label: string; bg: string; text: string }> = {
  high:   { label: 'Alta',  bg: '#FEE2E2', text: '#B91C1C' },
  medium: { label: 'Media', bg: '#FEF3C7', text: '#92400E' },
  low:    { label: 'Baja',  bg: '#F1F5F9', text: '#64748B' },
}

const STATUS_DOT: Record<string, string> = {
  backlog:     '#F59E0B',
  in_progress: '#3B82F6',
  review:      '#8B5CF6',
  completed:   '#10B981',
}

/* ── Reusable card wrapper ── */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden ${className}`}
      style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      {children}
    </div>
  )
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
      <h2 className="text-[13px] font-semibold text-gray-800">{title}</h2>
      {action && (
        <button className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
          {action} <ArrowRightIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

/* ── Main Component ── */
export default function InicioPage() {
  const recentTasks = mockTasks.slice(0, 6)

  return (
    /**
     * Layout: 100% viewport height, no scroll.
     * Estructura:
     *   - Fila de cabecera (título + KPIs compactos en la misma línea)
     *   - Cuerpo principal: dos columnas que llenan el espacio restante
     *     LEFT  (55%): tareas recientes (flex-1) + upcoming debajo
     *     RIGHT (45%): proyectos (flex-1) + actividad debajo
     */
    <div
      className="max-w-[1200px] mx-auto w-full"
      style={{ padding: '32px 40px' }}
    >

      {/* ══════════════════════════════════════════
          ROW 1 — Title
      ══════════════════════════════════════════ */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-[22px] font-bold text-gray-900 leading-tight">
          <HandRaisedIcon className="h-6 w-6 text-yellow-500" />
          Buen día, Martín
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">martes 22 de abril · resumen de hoy</p>
      </div>

      {/* ══════════════════════════════════════════
          ROW 2 — KPIs
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {mockStats.map((stat) => {
          let Icon = ClipboardDocumentListIcon
          if (stat.label === 'Completadas') Icon = CheckCircleIcon
          if (stat.label === 'En Progreso') Icon = ArrowPathIcon
          if (stat.label === 'Pendientes') Icon = ClockIcon

          return (
            <div
              key={stat.label}
              className="flex items-center gap-3.5 bg-white rounded-xl px-4 py-3"
              style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
            >
              {/* Icon badge */}
              <span
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: stat.bgColor, color: stat.color }}
              >
                <Icon className="h-5 w-5" />
              </span>

            {/* Content right */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[20px] font-bold text-gray-900 leading-none">{stat.value}</span>
                <span className="text-[12px] font-medium text-gray-500 leading-none truncate">{stat.label}</span>
              </div>
              <p className="text-[10.5px] mt-1 font-medium truncate" style={{ color: stat.color }}>
                {stat.delta}
              </p>
            </div>
          </div>
        )
      })}
      </div>

      {/* ══════════════════════════════════════════
          ROW 3 — Main body: two columns naturally sized
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-[1.2fr_1fr] gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-6">

          {/* Recent tasks */}
          <Card>
            <SectionHeader title="Tareas recientes" action="Ver todas" />
            <div>
              {recentTasks.map((task, i) => {
                const dot    = STATUS_DOT[task.status]  ?? '#9CA3AF'
                const prio   = PRIORITY_LABEL[task.priority] ?? PRIORITY_LABEL.low
                const avatar = AVATAR[task.assignee] ?? { bg: '#F3F4F6', text: '#374151' }
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                    style={{ borderBottom: i < recentTasks.length - 1 ? '1px solid #F9FAFB' : 'none' }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: dot }} />
                    <p className="flex-1 text-[12.5px] font-medium text-gray-800 truncate">{task.title}</p>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 shrink-0">{task.tag}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0" style={{ background: prio.bg, color: prio.text }}>{prio.label}</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-gray-400 shrink-0">
                      <CalendarIcon className="h-2.5 w-2.5" />
                      {task.dueDate.slice(5).replace('-', '/')}
                    </span>
                    <div className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0" style={{ background: avatar.bg, color: avatar.text }}>
                      {task.assignee}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Upcoming deadlines */}
          <Card>
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
              <ClockIcon className="h-4 w-4 text-gray-500" />
              <h2 className="text-[13px] font-semibold text-gray-800">Próximos vencimientos</h2>
            </div>
            <div>
              {mockUpcoming.slice(0, 4).map((item, i) => {
                const u      = URGENCY_COLOR[item.urgency]
                const avatar = AVATAR[item.assignee] ?? { bg: '#F3F4F6', text: '#374151' }
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                    style={{ borderBottom: i < mockUpcoming.slice(0,4).length - 1 ? '1px solid #F9FAFB' : 'none' }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: u.dot }} />
                    <p className="flex-1 text-[12.5px] font-medium text-gray-800 truncate">{item.title}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded shrink-0" style={{ background: u.bg, color: u.text }}>{item.dueLabel}</span>
                    <div className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0" style={{ background: avatar.bg, color: avatar.text }}>
                      {item.assignee}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-6">

          {/* Active projects (Charts) */}
          <Card>
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
              <ChartBarIcon className="h-4 w-4 text-gray-500" />
              <h2 className="text-[13px] font-semibold text-gray-800">Progreso de Metas</h2>
            </div>
            <div className="p-4" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockProjects} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#6B7280' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '12px' }}
                  />
                  <Bar dataKey="totalTasks" name="Total de tareas" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="completedTasks" name="Completadas" radius={[4, 4, 0, 0]} barSize={24}>
                    {mockProjects.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Activity feed */}
          <Card>
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
              <BellIcon className="h-4 w-4 text-gray-500" />
              <h2 className="text-[13px] font-semibold text-gray-800">Actividad reciente</h2>
            </div>
            <div>
              {mockActivity.slice(0, 4).map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-start gap-2.5 px-4 py-2.5"
                  style={{ borderBottom: i < 3 ? '1px solid #F9FAFB' : 'none' }}
                >
                  <div className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5" style={{ background: item.actorColor.bg, color: item.actorColor.text }}>
                    {item.actor}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11.5px] text-gray-600 leading-snug">
                      <span className="font-semibold text-gray-800">{item.actor}</span>
                      {' '}{item.action}{' '}
                      <span className="text-gray-500 truncate">{item.target}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.timeAgo}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
