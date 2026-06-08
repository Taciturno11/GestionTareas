import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { requireAdmin } from '../../middlewares/admin.middleware.js'
import { asyncHandler } from '../../shared/utils/async-handler.js'
import * as adminUsersController from './admin-users.controller.js'

const router = Router()

router.use(authMiddleware)
router.use(asyncHandler(requireAdmin))
router.get('/users', asyncHandler(adminUsersController.list))
router.post('/users', asyncHandler(adminUsersController.create))

export default router
