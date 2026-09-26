import { Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import { getDashboard } from '../services/news.service'

export const getFeed = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await getDashboard(req.user!.userId, false)
  res.json({ data })
})

export const refreshFeed = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await getDashboard(req.user!.userId, true)
  res.json({ data })
})
