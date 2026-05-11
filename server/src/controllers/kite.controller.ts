import { Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import * as kiteService from '../services/kite.service'

export const loginUrl = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const url = kiteService.getLoginUrl()
  res.json({ data: { loginUrl: url } })
})

export const handleCallback = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { requestToken } = z.object({ requestToken: z.string().min(1) }).parse(req.body)
  await kiteService.callback(req.user!.userId, requestToken)
  res.json({ data: { connected: true } })
})

export const status = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await kiteService.getStatus(req.user!.userId)
  res.json({ data })
})

export const holdings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await kiteService.getHoldings(req.user!.userId)
  res.json({ data })
})

export const triggerSync = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await kiteService.sync(req.user!.userId)
  res.json({ data: result })
})
