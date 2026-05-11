import { Response } from 'express'
import { z } from 'zod'
import { ExpenseType, ExpenseCategory } from '@prisma/client'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import * as expenseService from '../services/expense.service'

const MonthParam = z.string().regex(/^\d{4}-\d{2}$/)
const ExpenseTypeParam = z.nativeEnum(ExpenseType)
const CategoryParam = z.nativeEnum(ExpenseCategory)

export const getList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const month = MonthParam.optional().parse(req.query['month'])
  const type = ExpenseTypeParam.optional().parse(req.query['type'])
  const category = CategoryParam.optional().parse(req.query['category'])
  const q = req.query['q'] as string | undefined
  const records = await expenseService.list(req.user!.userId, { month, type, category, q })
  res.json({ data: records })
})

export const getSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const month = MonthParam.optional().parse(req.query['month'])
  const result = await expenseService.summary(req.user!.userId, month)
  res.json({ data: result })
})

export const createOne = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await expenseService.create(req.user!.userId, req.body)
  res.status(201).json({ data: result })
})

export const updateOne = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string
  const result = await expenseService.update(req.user!.userId, id, req.body)
  res.json({ data: result })
})

export const deleteOne = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string
  await expenseService.remove(req.user!.userId, id)
  res.status(204).send()
})
