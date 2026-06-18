import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import { env } from './config/env.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import adminUsersRoutes from './modules/admin-users/admin-users.routes.js'
import authRoutes from './modules/auth/auth.routes.js'
import pagesRoutes from './modules/pages/pages.routes.js'
import projectsRoutes from './modules/projects/projects.routes.js'
import spacesRoutes from './modules/spaces/spaces.routes.js'
import taskSettingsRoutes from './modules/task-settings/task-settings.routes.js'
import tasksRoutes from './modules/tasks/tasks.routes.js'
import usersRoutes from './modules/users/users.routes.js'
import workspacesRoutes from './modules/workspaces/workspaces.routes.js'
import { API_PREFIX } from './shared/constants/routes.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))
  app.use(express.json({ limit: '20mb' }))
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use(`${API_PREFIX}/auth`, authRoutes)
  app.use(`${API_PREFIX}/admin`, adminUsersRoutes)
  app.use(`${API_PREFIX}/users`, usersRoutes)
  app.use(`${API_PREFIX}/workspaces`, workspacesRoutes)
  app.use(`${API_PREFIX}/spaces`, spacesRoutes)
  app.use(`${API_PREFIX}/pages`, pagesRoutes)
  app.use(`${API_PREFIX}/projects`, projectsRoutes)
  app.use(`${API_PREFIX}/tasks`, tasksRoutes)
  app.use(`${API_PREFIX}/task-settings`, taskSettingsRoutes)

  app.use(errorMiddleware)

  return app
}
