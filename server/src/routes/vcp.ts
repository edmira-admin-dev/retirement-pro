import { Router } from 'express'
import { auth } from '../middleware/auth'
import * as vcpController from '../controllers/vcp.controller'

const router = Router()

router.post('/generate', auth, vcpController.generate)
router.get('/dates', auth, vcpController.dates)
router.get('/:date', auth, vcpController.getByDate)

export default router
