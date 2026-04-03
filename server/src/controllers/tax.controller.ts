import { Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import * as taxService from '../services/tax.service'

export const get = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await taxService.get(req.user!.userId)
  res.json({ data: profile })
})

export const upsert = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await taxService.upsert(req.user!.userId, req.body)
  res.json({ data: profile })
})
