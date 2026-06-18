import 'dotenv/config'
import { PrismaClient, WorkspaceRole } from '@prisma/client'

const prisma = new PrismaClient()
const SOURCE_NAMES = ['Unitek', 'Seleria', 'Estudios', 'Personal']
const shouldExecute = process.argv.includes('--execute')
const confirmation = process.argv.find(argument => argument.startsWith('--confirm='))?.split('=')[1]

async function main() {
  const martin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { contains: 'martin', mode: 'insensitive' } },
        { name: { contains: 'martin', mode: 'insensitive' } },
      ],
    },
    include: {
      memberships: {
        where: { role: WorkspaceRole.OWNER },
        include: {
          workspace: {
            include: {
              projects: true,
              settings: true,
              _count: { select: { spaces: true, pages: true, tasks: true } },
            },
          },
        },
      },
    },
  })

  if (!martin) throw new Error('No se encontro al usuario Martin')

  const sources = martin.memberships
    .map(membership => membership.workspace)
    .filter(workspace => SOURCE_NAMES.includes(workspace.name))

  if (sources.length === 0) {
    const existingDestination = martin.memberships
      .map(membership => membership.workspace)
      .find(workspace => workspace.name === 'Workspace de Martin')
    if (existingDestination) {
      console.log(JSON.stringify({
        mode: shouldExecute ? 'execute' : 'dry-run',
        status: 'already-consolidated',
        workspaceId: existingDestination.id,
        counts: existingDestination._count,
      }, null, 2))
      return
    }
  }

  if (sources.length !== SOURCE_NAMES.length) {
    throw new Error(`Se esperaban 4 workspaces historicos y se encontraron ${sources.length}`)
  }

  const summary = {
    mode: shouldExecute ? 'execute' : 'dry-run',
    user: { id: martin.id, name: martin.name, email: martin.email },
    sources: sources.map(workspace => ({
      id: workspace.id,
      name: workspace.name,
      counts: workspace._count,
      projects: workspace.projects.map(project => project.name),
    })),
    totals: sources.reduce((totals, workspace) => ({
      spaces: totals.spaces + workspace._count.spaces,
      pages: totals.pages + workspace._count.pages,
      tasks: totals.tasks + workspace._count.tasks,
    }), { spaces: 0, pages: 0, tasks: 0 }),
    destinationProjects: SOURCE_NAMES,
  }

  console.log(JSON.stringify(summary, null, 2))
  if (!shouldExecute) return
  if (confirmation !== 'ELIMINAR-WORKSPACES-HISTORICOS') {
    throw new Error('Confirmacion ausente. Use --execute --confirm=ELIMINAR-WORKSPACES-HISTORICOS')
  }

  const sourceIds = sources.map(workspace => workspace.id)
  const primarySettings = sources.find(workspace => workspace.name === 'Unitek')?.settings ?? sources[0].settings

  await prisma.$transaction(async transaction => {
    const destination = await transaction.workspace.create({
      data: {
        name: 'Workspace de Martin',
        color: '#6472EB',
        members: {
          create: { userId: martin.id, role: WorkspaceRole.OWNER },
        },
        settings: primarySettings ? {
          create: {
            projects: [],
            assignees: primarySettings.assignees,
            labels: primarySettings.labels,
            priorities: primarySettings.priorities,
            statuses: primarySettings.statuses,
          },
        } : undefined,
      },
    })

    const destinationProjects = new Map<string, string>()
    for (const name of SOURCE_NAMES) {
      const project = await transaction.project.create({
        data: { workspaceId: destination.id, name, color: '#6472EB' },
      })
      destinationProjects.set(name.toLowerCase(), project.id)
    }

    const tasks = await transaction.task.findMany({
      where: { workspaceId: { in: sourceIds } },
      include: { project: true, workspace: true },
    })

    for (const task of tasks) {
      const projectName = task.project?.name ?? task.workspace.name
      await transaction.task.update({
        where: { id: task.id },
        data: {
          workspaceId: destination.id,
          projectId: destinationProjects.get(projectName.toLowerCase()) ?? null,
        },
      })
    }

    await transaction.space.updateMany({
      where: { workspaceId: { in: sourceIds } },
      data: { workspaceId: destination.id },
    })
    await transaction.page.updateMany({
      where: { workspaceId: { in: sourceIds } },
      data: { workspaceId: destination.id },
    })
    await transaction.user.update({
      where: { id: martin.id },
      data: { personalWorkspaceId: destination.id },
    })
    await transaction.workspace.deleteMany({
      where: { id: { in: sourceIds } },
    })
  }, { timeout: 120_000 })

  console.log('Consolidacion completada.')
}

main()
  .finally(() => prisma.$disconnect())
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
