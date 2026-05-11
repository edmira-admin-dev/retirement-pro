import { Router } from 'express'
import { auth } from '../middleware/auth'
import * as networthController from '../controllers/networth.controller'

const router = Router()

router.get('/snapshots', auth, networthController.listSnapshots)

export default router
