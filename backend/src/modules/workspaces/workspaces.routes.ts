import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../shared/utils/async-handler.js'
import * as workspacesController from './workspaces.controller.js'

const router = Router()

router.use(authMiddleware)
router.get('/', asyncHandler(workspacesController.list))
router.post('/', asyncHandler(workspacesController.create))
router.get('/:id', asyncHandler(workspacesController.get))
router.patch('/:id', asyncHandler(workspacesController.update))
router.delete('/:id', asyncHandler(workspacesController.remove))

export default router
