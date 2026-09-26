import { Router } from 'express'
import { auth } from '../middleware/auth'
import { getLtp, getIndices, getIndexSectorAllocationHandler, getBenchmarkReturns } from '../controllers/market.controller'

const router = Router()
router.get('/ltp', auth, getLtp)
router.get('/indices', auth, getIndices)
router.get('/index-sector-allocation', auth, getIndexSectorAllocationHandler)
router.get('/benchmark-returns', auth, getBenchmarkReturns)
export default router
