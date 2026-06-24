import { expectArray, http } from './http'

export interface PublicUser {
  id: string
  email: string
  name: string
  role: string
  avatarUrl: string | null
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

export const usersApi = {
  search: async (query: string) => {
    const payload = await http<unknown>('/users/search', { query: { query } })
    return expectArray<unknown>(payload, 'users').map(normalizeUser)
  },
  updateProfile: (body: { name?: string; avatarUrl?: string | null }) =>
    http<unknown>('/users/me', { method: 'PATCH', body }).then(normalizeUser),
}
