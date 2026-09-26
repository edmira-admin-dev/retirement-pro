import { Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import { AppError } from '../middleware/errorHandler'
import * as scorecardSvc from '../services/factor-scorecard.service'
import * as fundamentalsSvc from '../services/factor-scorecard-fundamentals.service'
import * as aiSvc from '../services/factor-scorecard-ai.service'

function requireRunDate(body: unknown): string {
  const runDate = String((body as { runDate?: string })?.runDate ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(runDate)) throw new AppError(400, 'runDate must be YYYY-MM-DD')
  return runDate
}

export const upload = asyncHandler(async (req: AuthRequest, res: Response) => {
  const file = req.file
  if (!file) throw new AppError(400, 'No file uploaded')
  const runDate = requireRunDate(req.body)

  const result = await scorecardSvc.uploadScorecard(req.user!.userId, file.originalname, file.buffer, runDate)
  res.json({ data: result })
})

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await scorecardSvc.getScorecardData(req.user!.userId)
  res.json({ data })
})

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  await scorecardSvc.deleteUpload(req.user!.userId, String(req.params.uploadId))
  res.json({ data: { success: true } })
})

export const uploadFundamentals = asyncHandler(async (req: AuthRequest, res: Response) => {
  const file = req.file
  if (!file) throw new AppError(400, 'No file uploaded')
  const runDate = requireRunDate(req.body)

  const result = await fundamentalsSvc.uploadFundamentals(req.user!.userId, file.originalname, file.buffer, runDate)
  res.json({ data: result })
})

export const listFundamentals = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await fundamentalsSvc.listFundamentalsUploads(req.user!.userId)
  res.json({ data })
})

export const startRun = asyncHandler(async (req: AuthRequest, res: Response) => {
  const fundamentalsUploadId = String((req.body as { fundamentalsUploadId?: string })?.fundamentalsUploadId ?? '')
  if (!fundamentalsUploadId) throw new AppError(400, 'fundamentalsUploadId is required')

  const run = await aiSvc.startRun(req.user!.userId, fundamentalsUploadId)
  res.json({ data: run })
})

export const listRuns = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await aiSvc.listRuns(req.user!.userId)
  res.json({ data })
})

export const getRun = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await aiSvc.getRun(req.user!.userId, String(req.params.runId))
  res.json({ data })
})
