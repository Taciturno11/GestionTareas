import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../shared/utils/async-handler.js'
import * as spacesController from './spaces.controller.js'
import * as sharedSpacesController from '../shared-spaces/shared-spaces.controller.js'

const router = Router()

router.use(authMiddleware)
router.get('/', asyncHandler(spacesController.list))
router.post('/', asyncHandler(spacesController.create))
router.get('/:spaceId/shares', asyncHandler(sharedSpacesController.listForSpace))
router.post('/:spaceId/shares', asyncHandler(sharedSpacesController.create))
router.patch('/:spaceId/shares/:shareId', asyncHandler(sharedSpacesController.update))
router.delete('/:spaceId/shares/:shareId', asyncHandler(sharedSpacesController.remove))
router.patch('/:id', asyncHandler(spacesController.update))
router.post('/:id/archive', asyncHandler(spacesController.archive))
router.post('/:id/restore', asyncHandler(spacesController.restore))
router.delete('/:id', asyncHandler(spacesController.remove))

export default router
