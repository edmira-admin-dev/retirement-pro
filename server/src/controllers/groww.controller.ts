import { Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import * as growwService from '../services/groww.service'

export const connect = asyncHandler(async (req: AuthRequest, res: Response) => {
  await growwService.connect(req.user!.userId)
  res.json({ data: { connected: true } })
})

export const refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
  await growwService.refreshToken(req.user!.userId)
  res.json({ data: { refreshed: true } })
})

export const status = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await growwService.getStatus(req.user!.userId)
  res.json({ data })
})

export const holdings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await growwService.getHoldings(req.user!.userId)
  res.json({ data })
})

export const triggerSync = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await growwService.sync(req.user!.userId)
  res.json({ data: result })
})
