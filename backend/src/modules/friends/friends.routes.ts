import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../shared/utils/async-handler.js'
import * as friendsController from './friends.controller.js'

const router = Router()

router.use(authMiddleware)
router.get('/', asyncHandler(friendsController.listFriends))
router.delete('/:friendId', asyncHandler(friendsController.removeFriend))

export default router
