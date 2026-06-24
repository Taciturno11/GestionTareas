import { ArrowLeftIcon, ArrowRightOnRectangleIcon, PhotoIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { type ChangeEvent, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { AuthUser } from '@/api/auth.api'
import { usersApi } from '@/api/users.api'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { clearAuthToken } from '@/services/auth-token'

const AVATAR_SIZE = 128
const AVATAR_TARGET_BYTES = 50 * 1024
const AVATAR_MAX_SOURCE_BYTES = 10 * 1024 * 1024
const WEBP_QUALITIES = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5, 0.42, 0.35]

interface UserMenuProps {
  user: AuthUser | null
  isLoading?: boolean
  onUserUpdated?: () => void
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

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(imageUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl)
      reject(new Error('No se pudo leer la imagen.'))
    }
    image.src = imageUrl
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('No se pudo comprimir la imagen.'))
        return
      }
      resolve(blob)
    }, 'image/webp', quality)
  })
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }
      reject(new Error('No se pudo convertir la imagen.'))
    }
    reader.onerror = () => reject(new Error('No se pudo convertir la imagen.'))
    reader.readAsDataURL(blob)
  })
}

async function processAvatarFile(file: File) {
  const image = await loadImage(file)
  const canvas = document.createElement('canvas')
  canvas.width = AVATAR_SIZE
  canvas.height = AVATAR_SIZE

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Tu navegador no pudo procesar la imagen.')

  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight)
  const sourceX = Math.max(0, Math.floor((image.naturalWidth - sourceSize) / 2))
  const sourceY = Math.max(0, Math.floor((image.naturalHeight - sourceSize) / 2))

  context.clearRect(0, 0, AVATAR_SIZE, AVATAR_SIZE)
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  )

  let smallestBlob: Blob | null = null
  for (const quality of WEBP_QUALITIES) {
    const blob = await canvasToBlob(canvas, quality)
    smallestBlob = blob
    if (blob.size <= AVATAR_TARGET_BYTES) return blobToDataUrl(blob)
  }

  if (!smallestBlob || smallestBlob.size > AVATAR_TARGET_BYTES) {
    throw new Error('No se pudo comprimir la imagen por debajo de 50 KB.')
  }

  return blobToDataUrl(smallestBlob)
}

function AvatarPreview({ user, size = 'md' }: { user: AuthUser | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'h-7 w-7 text-[11px]',
    md: 'h-9 w-9 text-[12px]',
    lg: 'h-20 w-20 text-[22px]',
  }[size]

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={getDisplayName(user)}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    )
  }

  return (
    <span className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-[#6472EB] font-bold text-white`}>
      {getInitials(user)}
    </span>
  )
}

export default function UserMenu({ user, isLoading = false, onUserUpdated }: UserMenuProps) {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [mode, setMode] = useState<'menu' | 'profile'>('menu')
  const [message, setMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const displayName = isLoading ? 'Cargando...' : getDisplayName(user)
  const subtitle = user?.email ?? 'Sesion activa'

  function handleLogout() {
    clearAuthToken()
    navigate('/login', { replace: true })
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setMode('menu')
      setMessage(null)
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Selecciona una imagen valida.')
      return
    }

    if (file.size > AVATAR_MAX_SOURCE_BYTES) {
      setMessage('La imagen original debe pesar menos de 10 MB.')
      return
    }

    setIsSaving(true)
    setMessage('Procesando imagen…')
    try {
      const avatarUrl = await processAvatarFile(file)
      await usersApi.updateProfile({ avatarUrl })
      onUserUpdated?.()
      setMessage('Avatar actualizado.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo procesar la imagen.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger
        className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-gray-100"
        title="Cuenta"
      >
        <AvatarPreview user={user} size="sm" />
        <span className="hidden max-w-[150px] truncate text-[13px] font-medium text-gray-700 md:block">
          {displayName}
        </span>
      </PopoverTrigger>

      <PopoverContent className="w-72 gap-1 p-1.5" align="end" sideOffset={8}>
        {mode === 'menu' ? (
          <>
            <div className="flex items-center gap-3 rounded-md px-2 py-2">
              <AvatarPreview user={user} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-gray-900">{displayName}</p>
                <p className="truncate text-[12px] text-gray-500">{subtitle}</p>
              </div>
            </div>

            <div className="my-1 h-px bg-gray-100" />

            <button
              type="button"
              onClick={() => setMode('profile')}
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
          </>
        ) : (
          <div className="p-2">
            <button
              type="button"
              onClick={() => {
                setMode('menu')
                setMessage(null)
              }}
              className="mb-3 flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px] text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Volver
            </button>

            <div className="flex flex-col items-center text-center">
              <AvatarPreview user={user} size="lg" />
              <p className="mt-3 max-w-full truncate text-[14px] font-semibold text-gray-900">{displayName}</p>
              <p className="max-w-full truncate text-[12px] text-gray-500">{subtitle}</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving || !user}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6472EB] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#5360D8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PhotoIcon className="h-4 w-4" />
                {isSaving ? 'Guardando…' : 'Cambiar avatar'}
              </button>
            </div>

            <p className="mt-3 text-center text-[11px] leading-4 text-gray-400">
              Se recortará al centro, se guardará en 128x128 y se comprimirá a menos de 50 KB.
            </p>
            {message && (
              <p className="mt-2 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5 text-center text-[12px] text-gray-600">
                {message}
              </p>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
