import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../shared/utils/async-handler.js'
import * as controller from './shared-spaces.controller.js'

const router = Router()

router.use(authMiddleware)
router.get('/', asyncHandler(controller.listReceived))

export default router

