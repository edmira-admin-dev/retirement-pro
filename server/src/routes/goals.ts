import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { auth } from '../middleware/auth'
import * as goalsController from '../controllers/goals.controller'

const router = Router()

const GoalCategoryEnum = z.enum(['FIRE', 'EDUCATION', 'WEDDING', 'PARENTS', 'HOUSING', 'OTHER'])

const CreateGoalSchema = z.object({
  name: z.string().min(1).max(200),
  category: GoalCategoryEnum,
  targetAmount: z.number().int().min(0),
  targetYear: z.number().int().min(2024).max(2100),
  currentAllocation: z.number().int().min(0),
  inflationRate: z.number().min(0).max(30).optional(),
  notes: z.string().max(1000).optional(),
})

const UpdateGoalSchema = CreateGoalSchema.partial()

router.get('/', auth, goalsController.list)
router.post('/', auth, validate(CreateGoalSchema), goalsController.create)
router.patch('/:id', auth, validate(UpdateGoalSchema), goalsController.update)
router.delete('/:id', auth, goalsController.remove)

export default router
