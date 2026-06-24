import {
  PaperAirplaneIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { friendsApi, friendsKeys } from '@/api/friends.api'
import type { PublicUser } from '@/api/users.api'
import PageContainer from '@/components/PageContainer/PageContainer'

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </section>
  )
}

function getInitials(user: PublicUser) {
  const source = user.name?.trim() || user.email?.trim() || 'U'
  return source
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function UserAvatar({ user, size = 'md' }: { user: PublicUser; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'h-9 w-9 text-[12px]' : 'h-10 w-10 text-[13px]'
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    )
  }

  return (
    <div className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600`}>
      {getInitials(user)}
    </div>
  )
}

export default function FriendsPage() {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  const { data: friends = [] } = useQuery({
    queryKey: friendsKeys.list(''),
    queryFn: () => friendsApi.list(),
    staleTime: 30 * 1000,
  })
  const { data: outgoingRequests = [] } = useQuery({
    queryKey: friendsKeys.outgoing,
    queryFn: friendsApi.listOutgoingRequests,
    staleTime: 30 * 1000,
  })
  const { data: incomingRequests = [] } = useQuery({
    queryKey: friendsKeys.incoming,
    queryFn: friendsApi.listIncomingRequests,
    staleTime: 30 * 1000,
  })

  async function refreshFriends() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: friendsKeys.all }),
      queryClient.invalidateQueries({ queryKey: friendsKeys.incoming }),
      queryClient.invalidateQueries({ queryKey: friendsKeys.outgoing }),
    ])
  }

  async function handleSendRequest() {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || isSending) return

    setIsSending(true)
    setMessage(null)
    try {
      await friendsApi.createRequest(normalizedEmail)
      setEmail('')
      setMessage('Solicitud enviada correctamente.')
      await queryClient.invalidateQueries({ queryKey: friendsKeys.outgoing })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo enviar la solicitud.')
    } finally {
      setIsSending(false)
    }
  }

  async function handleCancelRequest(requestId: string) {
    await friendsApi.cancelRequest(requestId)
    await queryClient.invalidateQueries({ queryKey: friendsKeys.outgoing })
  }

  async function handleAcceptRequest(requestId: string) {
    await friendsApi.acceptRequest(requestId)
    await refreshFriends()
  }

  async function handleRejectRequest(requestId: string) {
    await friendsApi.rejectRequest(requestId)
    await refreshFriends()
  }

  async function handleRemoveFriend(friendId: string) {
    if (!window.confirm('¿Quitar este amigo? Los espacios ya compartidos se mantendrán.')) return
    await friendsApi.remove(friendId)
    await queryClient.invalidateQueries({ queryKey: friendsKeys.all })
  }

  return (
    <PageContainer size="wide" align="start" className="space-y-6">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6472EB]">
          Colaboracion
        </p>
        <h1 className="mt-2 text-[30px] font-bold text-gray-950">Amigos</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-6 text-gray-500">
          Agrega usuarios por correo para poder compartir espacios con ellos. Solo tus amigos
          aceptados aparecerán en el modal de compartir.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-[15px] font-semibold text-gray-900">Agregar amigo</h2>
            <p className="mt-1 text-[12px] text-gray-400">
              Escribe el correo exacto que usa la otra persona en la aplicacion.
            </p>
          </div>
          <div className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={email}
                onChange={event => {
                  setEmail(event.target.value)
                  setMessage(null)
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void handleSendRequest()
                  }
                }}
                placeholder="correo@ejemplo.com"
                className="cursor-text-dark h-11 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-[14px] text-gray-800 caret-gray-900 outline-none transition focus:border-gray-300 focus:ring-4 focus:ring-gray-200/60"
              />
              <button
                type="button"
                onClick={() => void handleSendRequest()}
                disabled={!email.trim() || isSending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6472EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#5360D8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                {isSending ? 'Enviando…' : 'Enviar solicitud'}
              </button>
            </div>
            {message && (
              <p className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-[13px] text-gray-600">
                {message}
              </p>
            )}
          </div>
        </Card>

        <Card>
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-[15px] font-semibold text-gray-900">Solicitudes recibidas</h2>
          </div>
          <div className="space-y-2 p-4">
            {incomingRequests.length ? incomingRequests.map(request => (
              <div key={request.id} className="rounded-xl border border-gray-100 p-3">
                <div className="flex items-center gap-3">
                  <UserAvatar user={request.requester} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-gray-800">{request.requester.name}</p>
                    <p className="truncate text-[12px] text-gray-400">{request.requester.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 pl-12">
                  <button
                    type="button"
                    onClick={() => void handleAcceptRequest(request.id)}
                    className="rounded-lg bg-[#6472EB] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#5360D8]"
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRejectRequest(request.id)}
                    className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            )) : (
              <p className="rounded-xl border border-dashed border-gray-200 p-4 text-[13px] text-gray-400">
                No tienes solicitudes pendientes.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-[15px] font-semibold text-gray-900">Mis amigos</h2>
            <p className="mt-1 text-[12px] text-gray-400">
              Estas personas pueden aparecer en el modal para compartir espacios.
            </p>
          </div>
          <div className="space-y-2 p-4">
            {friends.length ? friends.map(friendship => (
              <div key={friendship.id} className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5">
                <UserAvatar user={friendship.friend} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-gray-800">{friendship.friend.name}</p>
                  <p className="truncate text-[12px] text-gray-400">{friendship.friend.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRemoveFriend(friendship.friend.id)}
                  className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-red-500 hover:bg-red-50"
                >
                  Quitar
                </button>
              </div>
            )) : (
              <p className="rounded-xl border border-dashed border-gray-200 p-4 text-[13px] text-gray-400">
                Aún no tienes amigos. Envía una solicitud usando el correo de otro usuario.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-[15px] font-semibold text-gray-900">Solicitudes enviadas</h2>
          </div>
          <div className="space-y-2 p-4">
            {outgoingRequests.length ? outgoingRequests.map(request => (
              <div key={request.id} className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5">
                <UserAvatar user={request.recipient} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-gray-800">{request.recipient.name}</p>
                  <p className="truncate text-[12px] text-gray-400">{request.recipient.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCancelRequest(request.id)}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                  Cancelar
                </button>
              </div>
            )) : (
              <p className="rounded-xl border border-dashed border-gray-200 p-4 text-[13px] text-gray-400">
                No tienes solicitudes enviadas pendientes.
              </p>
            )}
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
