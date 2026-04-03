import { Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import * as gamificationService from '../services/gamification.service'

export const get = asyncHandler(async (req: AuthRequest, res: Response) => {
  const record = await gamificationService.get(req.user!.userId)
  res.json({ data: record })
})

export const patch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const record = await gamificationService.upsert(req.user!.userId, req.body)
  res.json({ data: record })
})
