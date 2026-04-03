import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { auth } from '../middleware/auth'
import * as taxController from '../controllers/tax.controller'

const router = Router()

const TaxProfileSchema = z.object({
  realizedGainsFY: z.number().int().min(0).optional(),
  unrealizedEquityGains: z.number().int().min(0).optional(),
})

router.get('/', auth, taxController.get)
router.put('/', auth, validate(TaxProfileSchema), taxController.upsert)

export default router
