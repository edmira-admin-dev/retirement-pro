import { Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import * as svc from '../services/preferences.service'

export const getPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const prefs = await svc.get(req.user!.userId)
  res.json({ data: prefs ?? {} })
})

export const patchPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const updated = await svc.upsert(req.user!.userId, req.body)
  res.json({ data: updated })
})
