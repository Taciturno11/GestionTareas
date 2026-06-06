import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../shared/utils/async-handler.js'
import * as authController from './auth.controller.js'

const router = Router()

router.post('/register', asyncHandler(authController.register))
router.post('/login', asyncHandler(authController.login))
router.post('/login/verify-otp', asyncHandler(authController.verifyLoginOtp))
router.post('/login/resend-otp', asyncHandler(authController.resendLoginOtp))
router.get('/me', authMiddleware, asyncHandler(authController.me))
router.patch('/me/2fa', authMiddleware, asyncHandler(authController.updateTwoFactor))

export default router
