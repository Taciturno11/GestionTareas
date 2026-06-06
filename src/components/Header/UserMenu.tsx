import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

import type { AuthUser } from '@/api/auth.api'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { clearAuthToken } from '@/services/auth-token'

interface UserMenuProps {
  user: AuthUser | null
  isLoading?: boolean
}

function getInitials(user: AuthUser | null) {
  const source = user?.name?.trim() || user?.email?.trim() || 'U'
  const parts = source.split(/\s+/)

  if (parts.length > 1) {
    return parts
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

function getDisplayName(user: AuthUser | null) {
  return user?.name?.trim() || user?.email?.split('@')[0] || 'Usuario'
}

export default function UserMenu({ user, isLoading = false }: UserMenuProps) {
  const navigate = useNavigate()
  const displayName = isLoading ? 'Cargando...' : getDisplayName(user)
  const subtitle = user?.email ?? 'Sesion activa'

  function handleLogout() {
    clearAuthToken()
    navigate('/login', { replace: true })
  }

  return (
    <Popover>
      <PopoverTrigger
        className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-gray-100"
        title="Cuenta"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6472EB] text-[11px] font-bold text-white">
          {getInitials(user)}
        </span>
        <span className="hidden max-w-[150px] truncate text-[13px] font-medium text-gray-700 md:block">
          {displayName}
        </span>
      </PopoverTrigger>

      <PopoverContent className="w-64 gap-1 p-1.5" align="end" sideOffset={8}>
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6472EB] text-[12px] font-bold text-white">
            {getInitials(user)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-gray-900">{displayName}</p>
            <p className="truncate text-[12px] text-gray-500">{subtitle}</p>
          </div>
        </div>

        <div className="my-1 h-px bg-gray-100" />

        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <UserCircleIcon className="h-4 w-4" />
          Ver perfil
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-red-600 transition-colors hover:bg-red-50"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          Cerrar sesion
        </button>
      </PopoverContent>
    </Popover>
  )
}
