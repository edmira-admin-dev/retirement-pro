import { Router, Request, Response } from 'express'
import authRoutes from './auth'
import holdingsRoutes from './holdings'
import fireRoutes from './fire'
import healthRoutes from './health'
import goalsRoutes from './goals'
import gamificationRoutes from './gamification'
import taxRoutes from './tax'
import networthRoutes from './networth'
import incomeRoutes from './income'
import expenseRoutes from './expense'
import preferencesRoutes from './preferences'
import tradeRoutes from './trade'
import signalRoutes from './signal'
import vcpRoutes from './vcp'
import tradebookRoutes from './tradebook'
import marketRoutes from './market'
import taxpnlRoutes from './taxpnl'
import equityHoldingsRoutes from './equity-holdings'
import mutualFundHoldingsRoutes from './mutual-fund-holdings'
import newsRoutes from './news'
import factorScorecardRoutes from './factor-scorecard'

const router = Router()

router.get('/health', (_req: Request, res: Response) => {
  res.json({ data: { status: 'ok', timestamp: new Date().toISOString() } })
})

router.use('/auth', authRoutes)
router.use('/holdings', holdingsRoutes)
router.use('/fire', fireRoutes)
router.use('/health-profile', healthRoutes)
router.use('/goals', goalsRoutes)
router.use('/gamification', gamificationRoutes)
router.use('/tax', taxRoutes)
router.use('/networth', networthRoutes)
router.use('/income', incomeRoutes)
router.use('/expenses', expenseRoutes)
router.use('/preferences', preferencesRoutes)
router.use('/trades', tradeRoutes)
router.use('/signals', signalRoutes)
router.use('/vcp-signals', vcpRoutes)
router.use('/tradebook', tradebookRoutes)
router.use('/market', marketRoutes)
router.use('/taxpnl', taxpnlRoutes)
router.use('/equity-holdings', equityHoldingsRoutes)
router.use('/mutual-fund-holdings', mutualFundHoldingsRoutes)
router.use('/news', newsRoutes)
router.use('/factor-scorecard', factorScorecardRoutes)

export default router
