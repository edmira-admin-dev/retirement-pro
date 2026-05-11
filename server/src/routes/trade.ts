import { Router } from 'express'
import { auth } from '../middleware/auth'
import * as tradeController from '../controllers/trade.controller'

const router = Router()

// specific sub-paths before /:id
router.get('/positions', auth, tradeController.getPositions)
router.get('/pnl', auth, tradeController.getPnl)
router.patch('/positions/:symbol/ltp', auth, tradeController.updateLtp)

router.get('/', auth, tradeController.list)
router.post('/', auth, tradeController.create)
router.patch('/:id', auth, tradeController.update)
router.delete('/:id', auth, tradeController.remove)

export default router
