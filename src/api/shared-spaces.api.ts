import type { SharedSpace } from '@/types/workspace'
import { expectArray, http } from './http'
import { normalizePageSummary, normalizeSpace, normalizeWorkspace } from './workspace.mappers'
import type { PublicUser } from './users.api'

export type SpaceShareRole = 'VIEWER' | 'EDITOR'

export interface SpaceShare {
  id: string
  spaceId?: string
  role: SpaceShareRole
  user: PublicUser
  createdAt: string
  updatedAt: string
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function normalizeRole(value: unknown): SpaceShareRole {
  return value === 'EDITOR' ? 'EDITOR' : 'VIEWER'
}

function normalizeUser(value: unknown): PublicUser {
  const user = asRecord(value)
  return {
    id: String(user.id ?? ''),
    email: String(user.email ?? ''),
    name: String(user.name ?? ''),
    role: String(user.role ?? 'usuario'),
  }
}

function normalizeSpaceShare(value: unknown): SpaceShare {
  const share = asRecord(value)
  return {
    id: String(share.id ?? ''),
    spaceId: typeof share.spaceId === 'string' ? share.spaceId : undefined,
    role: normalizeRole(share.role),
    user: normalizeUser(share.user),
    createdAt: String(share.createdAt ?? ''),
    updatedAt: String(share.updatedAt ?? ''),
  }
}

function normalizeSharedSpace(value: unknown): SharedSpace {
  const shared = asRecord(value)
  return {
    id: String(shared.id ?? ''),
    role: normalizeRole(shared.role),
    rootSpaceId: String(shared.rootSpaceId ?? ''),
    workspace: normalizeWorkspace(shared.workspace),
    spaces: expectArray<unknown>(shared.spaces, 'shared spaces').map(normalizeSpace),
    pages: expectArray<unknown>(shared.pages, 'shared pages').map(normalizePageSummary),
    createdAt: String(shared.createdAt ?? ''),
    updatedAt: String(shared.updatedAt ?? ''),
  }
}

export const sharedSpacesApi = {
  listMine: async () => {
    const payload = await http<unknown>('/shared-spaces')
    return expectArray<unknown>(payload, 'shared-spaces').map(normalizeSharedSpace)
  },
  listShares: async (spaceId: string) => {
    const payload = await http<unknown>(`/spaces/${spaceId}/shares`)
    return expectArray<unknown>(payload, 'space-shares').map(normalizeSpaceShare)
  },
  createShare: (spaceId: string, body: { userId: string; role: SpaceShareRole }) =>
    http<unknown>(`/spaces/${spaceId}/shares`, { method: 'POST', body }).then(normalizeSpaceShare),
  updateShare: (spaceId: string, shareId: string, body: { role: SpaceShareRole }) =>
    http<unknown>(`/spaces/${spaceId}/shares/${shareId}`, { method: 'PATCH', body }).then(normalizeSpaceShare),
  removeShare: (spaceId: string, shareId: string) =>
    http<void>(`/spaces/${spaceId}/shares/${shareId}`, { method: 'DELETE' }),
}

