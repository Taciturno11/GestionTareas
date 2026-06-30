import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../shared/utils/async-handler.js'
import * as tasksController from './tasks.controller.js'

const router = Router()

router.use(authMiddleware)
router.get('/', asyncHandler(tasksController.list))
router.post('/', asyncHandler(tasksController.create))
router.post('/:id/archive', asyncHandler(tasksController.archive))
router.post('/:id/restore', asyncHandler(tasksController.restore))
router.patch('/:id', asyncHandler(tasksController.update))
router.delete('/:id', asyncHandler(tasksController.remove))

export default router
