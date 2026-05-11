import { Router } from 'express'
import { z } from 'zod'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import * as controller from '../controllers/expense.controller'
import { CATEGORY_TYPE_MAP } from '../services/expense.service'
import { ExpenseType, ExpenseCategory } from '@prisma/client'

const router = Router()

const ExpenseBodyBase = z.object({
  merchant: z.string().min(1).max(200),
  amountPaise: z.number().int().positive(),
  expenseType: z.nativeEnum(ExpenseType),
  category: z.nativeEnum(ExpenseCategory),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  recurring: z.boolean().default(false),
  notes: z.string().max(1000).nullable().optional(),
  importedFrom: z.enum(['MANUAL', 'CSV']).nullable().optional(),
})

function categoryMatchesType(d: { expenseType?: ExpenseType; category?: ExpenseCategory }): boolean {
  if (!d.category || !d.expenseType) return true
  return CATEGORY_TYPE_MAP[d.category] === d.expenseType
}

const ExpenseBodySchema = ExpenseBodyBase.refine(categoryMatchesType, {
  message: 'category does not belong to the declared expenseType',
  path: ['category'],
})

const BatchOrSingleSchema = z.union([ExpenseBodySchema, z.array(ExpenseBodySchema).min(1)])

const UpdateSchema = ExpenseBodyBase.partial().refine(categoryMatchesType, {
  message: 'category does not belong to the declared expenseType',
  path: ['category'],
})

// /summary must come before /:id
router.get('/summary', auth, controller.getSummary)
router.get('/', auth, controller.getList)
router.post('/', auth, validate(BatchOrSingleSchema), controller.createOne)
router.patch('/:id', auth, validate(UpdateSchema), controller.updateOne)
router.delete('/:id', auth, controller.deleteOne)

export default router
