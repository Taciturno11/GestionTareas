import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../shared/utils/async-handler.js'
import * as authController from './auth.controller.js'

const router = Router()

router.post('/login', asyncHandler(authController.login))
router.post('/refresh', authMiddleware, asyncHandler(authController.refresh))
router.get('/me', authMiddleware, asyncHandler(authController.me))

export default router
