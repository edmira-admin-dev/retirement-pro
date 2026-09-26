import { Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import { AppError } from '../middleware/errorHandler'
import * as tb from '../services/tradebook.service'

export const parseUpload = asyncHandler(async (req: AuthRequest, res: Response) => {
  const file = req.file
  if (!file) throw new AppError(400, 'No file uploaded')
  const result = await tb.parseFile(req.user!.userId, file.originalname, file.buffer)
  res.json({ data: result })
})

export const saveBatch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body as tb.BatchSavePayload
  if (!Array.isArray(body?.fileNames)) throw new AppError(400, 'Invalid payload — missing fileNames')
  const result = await tb.saveBatch(req.user!.userId, body)
  res.json({ data: result })
})

export const listTrades = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await tb.getTrades(req.user!.userId)
  res.json({ data })
})

export const listDividends = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await tb.getDividends(req.user!.userId)
  res.json({ data })
})

export const listCharges = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await tb.getCharges(req.user!.userId)
  res.json({ data })
})

export const listHoldings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await tb.getHoldings(req.user!.userId)
  res.json({ data })
})

export const listRealizedPnl = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await tb.getRealizedPnl(req.user!.userId)
  res.json({ data })
})

export const getDividendSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await tb.getDividendSummary(req.user!.userId)
  res.json({ data })
})
