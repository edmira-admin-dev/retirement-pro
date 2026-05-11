import { Router } from 'express'
import { auth } from '../middleware/auth'
import * as brokerController from '../controllers/broker.controller'
import kiteRouter from './kite'
import growwRouter from './groww'

const router = Router()

router.use('/kite', kiteRouter)
router.use('/groww', growwRouter)
router.get('/', auth, brokerController.list)
router.delete('/:broker', auth, brokerController.disconnect)

export default router
