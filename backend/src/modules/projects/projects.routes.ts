import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../shared/utils/async-handler.js'
import * as projectsController from './projects.controller.js'

const router = Router()

router.use(authMiddleware)
router.get('/', asyncHandler(projectsController.list))
router.post('/', asyncHandler(projectsController.create))
router.patch('/:id', asyncHandler(projectsController.update))
router.post('/:id/archive', asyncHandler(projectsController.archive))
router.post('/:id/restore', asyncHandler(projectsController.restore))

export default router
