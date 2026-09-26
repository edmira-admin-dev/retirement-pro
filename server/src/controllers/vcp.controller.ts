import { Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import * as vcpService from '../services/vcp.service'

export const generate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const signals = await vcpService.generateVCPSignals(req.user!.userId)
  res.json({ data: signals })
})

export const getByDate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const date = (req.params['date'] as string) || new Date().toISOString().slice(0, 10)
  const signals = await vcpService.getVCPSignalsForDate(req.user!.userId, date)
  res.json({ data: signals })
})

export const dates = asyncHandler(async (req: AuthRequest, res: Response) => {
  const list = await vcpService.listVCPSignalDates(req.user!.userId)
  res.json({ data: list })
})
