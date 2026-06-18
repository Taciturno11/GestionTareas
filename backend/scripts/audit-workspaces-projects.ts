import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const workspaces = await prisma.workspace.findMany({
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      projects: true,
      _count: { select: { spaces: true, pages: true, tasks: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  const invalidTasks = await prisma.task.findMany({
    where: {
      projectId: { not: null },
      project: null,
    },
    select: { id: true, title: true, workspaceId: true, projectId: true },
  })

  const usersWithoutPersonalWorkspace = await prisma.user.findMany({
    where: { personalWorkspaceId: null },
    select: { id: true, name: true, email: true },
  })

  const report = {
    generatedAt: new Date().toISOString(),
    workspaces: workspaces.map(workspace => ({
      id: workspace.id,
      name: workspace.name,
      owners: workspace.members
        .filter(member => member.role === 'OWNER')
        .map(member => member.user),
      members: workspace.members.length,
      projects: workspace.projects.map(project => ({
        id: project.id,
        name: project.name,
        archived: Boolean(project.archivedAt),
      })),
      counts: workspace._count,
      orphan: workspace.members.length === 0,
    })),
    invalidTasks,
    usersWithoutPersonalWorkspace,
  }

  console.log(JSON.stringify(report, null, 2))
  if (invalidTasks.length || usersWithoutPersonalWorkspace.length) process.exitCode = 2
}

main()
  .finally(() => prisma.$disconnect())
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
