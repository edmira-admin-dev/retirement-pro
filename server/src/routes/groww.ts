import { Router } from 'express'
import { auth } from '../middleware/auth'
import * as growwController from '../controllers/groww.controller'

const router = Router()

router.post('/connect', auth, growwController.connect)
router.post('/refresh-token', auth, growwController.refresh)
router.get('/status', auth, growwController.status)
router.get('/holdings', auth, growwController.holdings)
router.post('/sync', auth, growwController.triggerSync)

export default router
