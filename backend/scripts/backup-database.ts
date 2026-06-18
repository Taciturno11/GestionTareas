import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outputDirectory = resolve('backups')
  const outputPath = resolve(outputDirectory, `database-${timestamp}.json`)

  const [users, workspaces, members, spaces, pages, tasks, taskSettings] = await Promise.all([
    prisma.user.findMany(),
    prisma.workspace.findMany(),
    prisma.workspaceMember.findMany(),
    prisma.space.findMany(),
    prisma.page.findMany(),
    prisma.task.findMany(),
    prisma.taskSettings.findMany(),
  ])

  await mkdir(outputDirectory, { recursive: true })
  await writeFile(outputPath, JSON.stringify({
    exportedAt: new Date().toISOString(),
    counts: {
      users: users.length,
      workspaces: workspaces.length,
      members: members.length,
      spaces: spaces.length,
      pages: pages.length,
      tasks: tasks.length,
      taskSettings: taskSettings.length,
    },
    users,
    workspaces,
    members,
    spaces,
    pages,
    tasks,
    taskSettings,
  }, null, 2))

  console.log(JSON.stringify({ outputPath, counts: {
    users: users.length,
    workspaces: workspaces.length,
    members: members.length,
    spaces: spaces.length,
    pages: pages.length,
    tasks: tasks.length,
    taskSettings: taskSettings.length,
  } }, null, 2))
}

main()
  .finally(() => prisma.$disconnect())
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
