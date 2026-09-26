import { Router } from 'express'
import multer from 'multer'
import { auth } from '../middleware/auth'
import * as ctrl from '../controllers/mutual-fund-holdings.controller'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })
const router = Router()

router.post('/parse', auth, upload.single('file'), ctrl.parseUpload)
router.post('/save-batch', auth, ctrl.saveBatch)
router.get('/', auth, ctrl.list)
router.get('/dates', auth, ctrl.listDates)

export default router
