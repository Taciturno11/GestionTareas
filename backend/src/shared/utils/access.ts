import { prisma } from '../../database/prisma.js'
import { HttpError } from './http-error.js'

type SpaceAccessRole = 'OWNER' | 'EDITOR' | 'VIEWER'

function includesSpaceInTree(
  spaces: Array<{ id: string; parentId: string | null }>,
  rootId: string,
  targetId: string,
) {
  if (rootId === targetId) return true
  const byParent = new Map<string | null, Array<{ id: string; parentId: string | null }>>()
  spaces.forEach(space => {
    const siblings = byParent.get(space.parentId) ?? []
    siblings.push(space)
    byParent.set(space.parentId, siblings)
  })

  const queue = [...(byParent.get(rootId) ?? [])]
  while (queue.length) {
    const current = queue.shift()
    if (!current) continue
    if (current.id === targetId) return true
    queue.push(...(byParent.get(current.id) ?? []))
  }
  return false
}

export async function assertWorkspaceMember(userId: string, workspaceId: string) {
  const [user, member] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    }),
  ])

  if (user?.role === 'admin') return member
  if (!member) throw new HttpError(403, 'Workspace access denied')
  return member
}

export async function assertWorkspaceOwner(userId: string, workspaceId: string) {
  const member = await assertWorkspaceMember(userId, workspaceId)
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (user?.role === 'admin') return member
  if (!member) throw new HttpError(403, 'Workspace owner access required')
  if (member.role !== 'OWNER') throw new HttpError(403, 'Workspace owner access required')
  return member
}

export async function resolveSpaceAccess(userId: string, spaceId: string): Promise<SpaceAccessRole> {
  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    select: { id: true, workspaceId: true },
  })
  if (!space) throw new HttpError(404, 'Space not found')

  const [user, member] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: space.workspaceId } },
    }),
  ])

  if (user?.role === 'admin' || member?.role === 'OWNER') return 'OWNER'
  if (member) return 'EDITOR'

  const shares = await prisma.spaceShare.findMany({
    where: {
      userId,
      space: { workspaceId: space.workspaceId },
    },
    select: {
      role: true,
      spaceId: true,
    },
  })
  if (!shares.length) throw new HttpError(403, 'Space access denied')

  const workspaceSpaces = await prisma.space.findMany({
    where: { workspaceId: space.workspaceId },
    select: { id: true, parentId: true },
  })

  const matchingShare = shares.find(share =>
    includesSpaceInTree(workspaceSpaces, share.spaceId, space.id)
  )
  if (!matchingShare) throw new HttpError(403, 'Space access denied')

  return matchingShare.role === 'EDITOR' ? 'EDITOR' : 'VIEWER'
}

export async function assertSpaceView(userId: string, spaceId: string) {
  return resolveSpaceAccess(userId, spaceId)
}

export async function assertSpaceEdit(userId: string, spaceId: string) {
  const role = await resolveSpaceAccess(userId, spaceId)
  if (role !== 'OWNER' && role !== 'EDITOR') {
    throw new HttpError(403, 'Space edit access required')
  }
  return role
}

export async function assertSpaceShareManager(userId: string, spaceId: string) {
  const role = await resolveSpaceAccess(userId, spaceId)
  if (role !== 'OWNER') throw new HttpError(403, 'Workspace owner access required')
  return role
}

export async function assertPageView(userId: string, pageId: string) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { spaceId: true },
  })
  if (!page) throw new HttpError(404, 'Page not found')
  return assertSpaceView(userId, page.spaceId)
}

export async function assertPageEdit(userId: string, pageId: string) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { spaceId: true },
  })
  if (!page) throw new HttpError(404, 'Page not found')
  return assertSpaceEdit(userId, page.spaceId)
}
