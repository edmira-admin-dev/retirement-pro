import { Router } from 'express'
import { auth } from '../middleware/auth'
import { getFeed, refreshFeed } from '../controllers/news.controller'

const router = Router()
router.get('/', auth, getFeed)
router.post('/refresh', auth, refreshFeed)
export default router
