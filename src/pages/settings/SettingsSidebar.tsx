import { NavLink } from 'react-router-dom'

export interface SettingsNavItem {
  label: string
  to: string
  count?: number
}

export interface SettingsNavGroup {
  title: string
  items: SettingsNavItem[]
}

export default function SettingsSidebar({ groups }: { groups: SettingsNavGroup[] }) {
  return (
    <aside className="shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:w-[248px]">
      <nav className="flex gap-2 overflow-x-auto lg:block lg:space-y-5 lg:overflow-visible">
        {groups.map(group => (
          <div key={group.title} className="min-w-[176px] lg:min-w-0">
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {group.title}
            </p>
            <div className="flex gap-1 lg:block lg:space-y-1">
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `flex min-h-10 items-center justify-between gap-2 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#6472EB] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {({ isActive }) => (
                    <>
                      <span className="truncate">{item.label}</span>
                      {typeof item.count === 'number' && (
                        <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                          isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
