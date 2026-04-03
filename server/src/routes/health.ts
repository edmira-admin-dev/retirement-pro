import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { auth } from '../middleware/auth'
import * as healthController from '../controllers/health.controller'

const router = Router()

const HealthProfileSchema = z.object({
  monthlyIncome: z.number().int().min(0),
  monthlyExpenses: z.number().int().min(0),
  monthlyEMIs: z.number().int().min(0),
  liquidAssets: z.number().int().min(0),
  totalLiabilities: z.number().int().min(0),
  monthlySavings: z.number().int().min(0),
  hasTermInsurance: z.boolean().optional(),
  hasHealthInsurance: z.boolean().optional(),
  hasWill: z.boolean().optional(),
  hasNominations: z.boolean().optional(),
})

router.get('/', auth, healthController.get)
router.put('/', auth, validate(HealthProfileSchema), healthController.upsert)

export default router
