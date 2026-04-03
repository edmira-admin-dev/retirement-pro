import { Router, Request, Response } from 'express'
import authRoutes from './auth'
import holdingsRoutes from './holdings'
import fireRoutes from './fire'
import healthRoutes from './health'
import goalsRoutes from './goals'
import gamificationRoutes from './gamification'
import taxRoutes from './tax'

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

export default router
