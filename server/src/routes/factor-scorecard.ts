import { Router } from 'express'
import multer from 'multer'
import { auth } from '../middleware/auth'
import * as ctrl from '../controllers/factor-scorecard.controller'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })
const router = Router()

router.post('/upload', auth, upload.single('file'), ctrl.upload)
router.get('/', auth, ctrl.list)
router.delete('/uploads/:uploadId', auth, ctrl.remove)

router.post('/fundamentals/upload', auth, upload.single('file'), ctrl.uploadFundamentals)
router.get('/fundamentals', auth, ctrl.listFundamentals)

router.post('/run', auth, ctrl.startRun)
router.get('/runs', auth, ctrl.listRuns)
router.get('/runs/:runId', auth, ctrl.getRun)

export default router
