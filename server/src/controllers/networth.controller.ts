import { Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import * as networthService from '../services/networth.service'

export const listSnapshots = asyncHandler(async (req: AuthRequest, res: Response) => {
  const snapshots = await networthService.listSnapshots(req.user!.userId)
  res.json({ data: snapshots })
})
