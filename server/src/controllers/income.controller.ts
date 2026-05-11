import { Response } from 'express'
import { z } from 'zod'
import { IncomeCategory, RecurringFrequency } from '@prisma/client'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import * as incomeService from '../services/income.service'

const incomeCategoryValues = Object.values(IncomeCategory) as [IncomeCategory, ...IncomeCategory[]]
const recurringFrequencyValues = Object.values(RecurringFrequency) as [RecurringFrequency, ...RecurringFrequency[]]

const MonthParam = z.string().regex(/^\d{4}-\d{2}$/)
const CategoryParam = z.enum(incomeCategoryValues)

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const month = MonthParam.optional().parse(req.query['month'])
  const category = CategoryParam.optional().parse(req.query['category'])
  const records = await incomeService.list(req.user!.userId, month, category)
  res.json({ data: records })
})

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const record = await incomeService.create(req.user!.userId, req.body)
  res.status(201).json({ data: record })
})

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string
  const record = await incomeService.update(req.user!.userId, id, req.body)
  res.json({ data: record })
})

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string
  await incomeService.remove(req.user!.userId, id)
  res.status(204).send()
})

export const getSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const month = MonthParam.optional().parse(req.query['month'])
  const data = await incomeService.summary(req.user!.userId, month)
  res.json({ data })
})

export { incomeCategoryValues, recurringFrequencyValues }
