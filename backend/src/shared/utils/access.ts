import { prisma } from '../../database/prisma.js'
import { HttpError } from './http-error.js'

export async function assertWorkspaceMember(userId: string, workspaceId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  })

  if (!member) throw new HttpError(403, 'Workspace access denied')
  return member
}

export async function assertWorkspaceOwner(userId: string, workspaceId: string) {
  const member = await assertWorkspaceMember(userId, workspaceId)
  if (member.role !== 'OWNER') throw new HttpError(403, 'Workspace owner access required')
  return member
}
