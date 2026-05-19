import { env } from './config/env.js'
import { createApp } from './app.js'
import { prisma } from './database/prisma.js'

const app = createApp()

const server = app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`)
})

async function shutdown() {
  await prisma.$disconnect()
  server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
