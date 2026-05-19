import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../shared/utils/async-handler.js'
import * as pagesController from './pages.controller.js'

const router = Router()

router.use(authMiddleware)
router.get('/', asyncHandler(pagesController.list))
router.post('/', asyncHandler(pagesController.create))
router.get('/:id', asyncHandler(pagesController.get))
router.patch('/:id', asyncHandler(pagesController.update))
router.delete('/:id', asyncHandler(pagesController.remove))

export default router
