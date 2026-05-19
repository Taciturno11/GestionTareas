import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../shared/utils/async-handler.js'
import * as usersController from './users.controller.js'

const router = Router()

router.use(authMiddleware)
router.get('/me', asyncHandler(usersController.getProfile))
router.patch('/me', asyncHandler(usersController.updateProfile))

export default router
