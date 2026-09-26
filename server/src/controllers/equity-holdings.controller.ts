import { Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import { AppError } from '../middleware/errorHandler'
import * as eh from '../services/equity-holdings.service'

export const parseUpload = asyncHandler(async (req: AuthRequest, res: Response) => {
  const file = req.file
  if (!file) throw new AppError(400, 'No file uploaded')
  const result = await eh.parseFile(req.user!.userId, file.originalname, file.buffer)
  res.json({ data: result })
})

export const saveBatch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body as { holdings: eh.ParsedEquityHolding[] }
  if (!Array.isArray(body?.holdings)) throw new AppError(400, 'Invalid payload — missing holdings')
  const result = await eh.saveBatch(req.user!.userId, body.holdings)
  res.json({ data: result })
})

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const asOfDate = typeof req.query['asOfDate'] === 'string' ? req.query['asOfDate'] : undefined
  const data = await eh.getHoldings(req.user!.userId, asOfDate)
  res.json({ data })
})

export const listDates = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await eh.getDates(req.user!.userId)
  res.json({ data })
})
