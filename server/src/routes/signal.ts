import { Router } from 'express'
import { auth } from '../middleware/auth'
import * as signalController from '../controllers/signal.controller'

const router = Router()

router.post('/generate', auth, signalController.generate)
router.post('/evaluate', auth, signalController.evaluate)
router.get('/dates', auth, signalController.dates)
router.get('/stats', auth, signalController.stats)
router.get('/:date', auth, signalController.getByDate)

export default router
