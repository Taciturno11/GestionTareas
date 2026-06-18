import { prisma } from '../../database/prisma.js'
import { HttpError } from './http-error.js'

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
