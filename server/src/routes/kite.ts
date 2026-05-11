import { Router } from 'express'
import { auth } from '../middleware/auth'
import * as kiteController from '../controllers/kite.controller'

const router = Router()

router.get('/login-url', auth, kiteController.loginUrl)
router.post('/callback', auth, kiteController.handleCallback)
router.get('/status', auth, kiteController.status)
router.get('/holdings', auth, kiteController.holdings)
router.post('/sync', auth, kiteController.triggerSync)

export default router
