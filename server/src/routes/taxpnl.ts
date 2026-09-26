import { Router } from 'express'
import { auth } from '../middleware/auth'
import * as ctrl from '../controllers/taxpnl.controller'

const router = Router()

router.post('/save', auth, ctrl.save)
router.get('/data', auth, ctrl.getData)
router.delete('/data', auth, ctrl.deleteData)
router.get('/holdings', auth, ctrl.getAllHoldings)
router.get('/exited-symbols', auth, ctrl.getExitedSymbols)
router.get('/symbol-summary', auth, ctrl.getSymbolSummary)
router.get('/brokers', auth, ctrl.getBrokers)

export default router
