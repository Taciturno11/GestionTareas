import { expectArray, http } from './http'
import type { PublicUser } from './users.api'

export interface Friendship {
  id: string
  friend: PublicUser
  createdAt: string
}

export type FriendRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED'

export interface FriendRequest {
  id: string
  requesterId: string
  recipientId: string
  status: FriendRequestStatus
  createdAt: string
  updatedAt: string
  respondedAt: string | null
  requester: PublicUser
  recipient: PublicUser
}

function normalizeUser(value: unknown): PublicUser {
  const user = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  return {
    id: String(user.id ?? ''),
    email: String(user.email ?? ''),
    name: String(user.name ?? ''),
    role: String(user.role ?? 'usuario'),
    avatarUrl: typeof user.avatarUrl === 'string' ? user.avatarUrl : null,
  }
}

function normalizeFriendship(value: unknown): Friendship {
  const friendship = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  return {
    id: String(friendship.id ?? ''),
    friend: normalizeUser(friendship.friend),
    createdAt: String(friendship.createdAt ?? ''),
  }
}

function normalizeFriendRequest(value: unknown): FriendRequest {
  const request = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const status = String(request.status ?? 'PENDING')

  return {
    id: String(request.id ?? ''),
    requesterId: String(request.requesterId ?? ''),
    recipientId: String(request.recipientId ?? ''),
    status: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED'].includes(status)
      ? status as FriendRequestStatus
      : 'PENDING',
    createdAt: String(request.createdAt ?? ''),
    updatedAt: String(request.updatedAt ?? ''),
    respondedAt: request.respondedAt ? String(request.respondedAt) : null,
    requester: normalizeUser(request.requester),
    recipient: normalizeUser(request.recipient),
  }
}

export const friendsKeys = {
  all: ['friends'] as const,
  list: (query = '') => ['friends', query] as const,
  incoming: ['friend-requests', 'incoming'] as const,
  outgoing: ['friend-requests', 'outgoing'] as const,
}

export const friendsApi = {
  list: async (query = '') => {
    const payload = await http<unknown>('/friends', { query: { query } })
    return expectArray<unknown>(payload, 'friends').map(normalizeFriendship)
  },
  remove: (friendId: string) => http<null>(`/friends/${friendId}`, { method: 'DELETE' }),
  createRequest: (email: string) =>
    http<unknown>('/friend-requests', { method: 'POST', body: { email } }).then(normalizeFriendRequest),
  listIncomingRequests: async () => {
    const payload = await http<unknown>('/friend-requests/incoming')
    return expectArray<unknown>(payload, 'incoming friend requests').map(normalizeFriendRequest)
  },
  listOutgoingRequests: async () => {
    const payload = await http<unknown>('/friend-requests/outgoing')
    return expectArray<unknown>(payload, 'outgoing friend requests').map(normalizeFriendRequest)
  },
  acceptRequest: (requestId: string) =>
    http<unknown>(`/friend-requests/${requestId}/accept`, { method: 'POST' }),
  rejectRequest: (requestId: string) =>
    http<unknown>(`/friend-requests/${requestId}/reject`, { method: 'POST' }),
  cancelRequest: (requestId: string) =>
    http<unknown>(`/friend-requests/${requestId}/cancel`, { method: 'POST' }),
}
