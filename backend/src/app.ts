import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import { env } from './config/env.js'
import { errorMiddleware } from './middlewares/error.middleware.js'
import authRoutes from './modules/auth/auth.routes.js'
import pagesRoutes from './modules/pages/pages.routes.js'
import spacesRoutes from './modules/spaces/spaces.routes.js'
import taskSettingsRoutes from './modules/task-settings/task-settings.routes.js'
import tasksRoutes from './modules/tasks/tasks.routes.js'
import usersRoutes from './modules/users/users.routes.js'
import workspacesRoutes from './modules/workspaces/workspaces.routes.js'
import { API_PREFIX } from './shared/constants/routes.js'

export function createApp() {
  const app = express()
  const allowedOrigins = env.CORS_ORIGIN.split(',').map(origin => origin.trim())

  app.use(helmet())
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }))
  app.use(express.json({ limit: '2mb' }))
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use(`${API_PREFIX}/auth`, authRoutes)
  app.use(`${API_PREFIX}/users`, usersRoutes)
  app.use(`${API_PREFIX}/workspaces`, workspacesRoutes)
  app.use(`${API_PREFIX}/spaces`, spacesRoutes)
  app.use(`${API_PREFIX}/pages`, pagesRoutes)
  app.use(`${API_PREFIX}/tasks`, tasksRoutes)
  app.use(`${API_PREFIX}/task-settings`, taskSettingsRoutes)

  app.use(errorMiddleware)

  return app
}
