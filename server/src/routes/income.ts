import { Router } from 'express'
import { z } from 'zod'
import { IncomeCategory, RecurringFrequency } from '@prisma/client'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import * as incomeController from '../controllers/income.controller'

const router = Router()

const incomeCategoryValues = Object.values(IncomeCategory) as [IncomeCategory, ...IncomeCategory[]]
const recurringFrequencyValues = Object.values(RecurringFrequency) as [RecurringFrequency, ...RecurringFrequency[]]

const CreateIncomeSchema = z.object({
  source: z.string().min(1).max(200),
  amountPaise: z.number().int().positive(),
  category: z.enum(incomeCategoryValues),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  recurring: z.boolean().default(false),
  frequency: z.enum(recurringFrequencyValues).default('ONE_TIME'),
  notes: z.string().nullable().optional(),
})

const UpdateIncomeSchema = CreateIncomeSchema.partial()

router.get('/summary', auth, incomeController.getSummary)
router.get('/', auth, incomeController.list)
router.post('/', auth, validate(CreateIncomeSchema), incomeController.create)
router.patch('/:id', auth, validate(UpdateIncomeSchema), incomeController.update)
router.delete('/:id', auth, incomeController.remove)

export default router
