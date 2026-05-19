import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../shared/utils/async-handler.js'
import * as taskSettingsController from './task-settings.controller.js'

const router = Router()

router.use(authMiddleware)
router.get('/', asyncHandler(taskSettingsController.get))
router.put('/', asyncHandler(taskSettingsController.upsert))

export default router
