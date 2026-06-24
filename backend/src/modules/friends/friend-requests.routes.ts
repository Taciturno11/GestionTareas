import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../shared/utils/async-handler.js'
import * as friendsController from './friends.controller.js'

const router = Router()

router.use(authMiddleware)
router.post('/', asyncHandler(friendsController.createRequest))
router.get('/incoming', asyncHandler(friendsController.listIncomingRequests))
router.get('/outgoing', asyncHandler(friendsController.listOutgoingRequests))
router.post('/:requestId/accept', asyncHandler(friendsController.acceptRequest))
router.post('/:requestId/reject', asyncHandler(friendsController.rejectRequest))
router.post('/:requestId/cancel', asyncHandler(friendsController.cancelRequest))

export default router
