import { Router } from 'express'
import multer from 'multer'
import { auth } from '../middleware/auth'
import * as ctrl from '../controllers/tradebook.controller'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })
const router = Router()

router.post('/parse', auth, upload.single('file'), ctrl.parseUpload)
router.post('/save-batch', auth, ctrl.saveBatch)
router.get('/trades', auth, ctrl.listTrades)
router.get('/dividends', auth, ctrl.listDividends)
router.get('/charges', auth, ctrl.listCharges)
router.get('/holdings', auth, ctrl.listHoldings)
router.get('/realized-pnl', auth, ctrl.listRealizedPnl)
router.get('/dividend-summary', auth, ctrl.getDividendSummary)

export default router
