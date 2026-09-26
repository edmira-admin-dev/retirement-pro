import { Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import * as signalService from '../services/signal.service'

export const generate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const signals = await signalService.generateSignals(req.user!.userId)
  res.json({ data: signals })
})

export const getByDate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const date = (req.params['date'] as string) || new Date().toISOString().slice(0, 10)
  const signals = await signalService.getSignalsForDate(req.user!.userId, date)
  res.json({ data: signals })
})

export const dates = asyncHandler(async (req: AuthRequest, res: Response) => {
  const list = await signalService.listSignalDates(req.user!.userId)
  res.json({ data: list })
})

export const evaluate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await signalService.evaluateOutcomes(req.user!.userId)
  res.json({ data: result })
})

export const stats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await signalService.getSuccessStats(req.user!.userId)
  res.json({ data: result })
})
