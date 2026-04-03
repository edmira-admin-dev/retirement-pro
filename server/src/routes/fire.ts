import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { auth } from '../middleware/auth'
import * as fireController from '../controllers/fire.controller'

const router = Router()

const FireProfileSchema = z.object({
  currentAge: z.number().int().min(18).max(80),
  retirementAge: z.number().int().min(30).max(80).optional(),
  lifeExpectancy: z.number().int().min(60).max(110).optional(),
  currentMonthlyExpense: z.number().int().min(0),
  medicalMonthlyExpense: z.number().int().min(0),
  lifestyleBuffer: z.number().min(0).max(100).optional(),
  expectedReturnPre: z.number().min(0).max(50).optional(),
  expectedReturnPost: z.number().min(0).max(50).optional(),
})

router.get('/', auth, fireController.get)
router.put('/', auth, validate(FireProfileSchema), fireController.upsert)

export default router
