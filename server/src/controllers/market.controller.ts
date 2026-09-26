import { Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import { AppError } from '../middleware/errorHandler'
import { fetchLtp } from '../services/market.service'
import { INDICES, getIndexSectorAllocation, IndexKey } from '../services/index-master.service'
import { getAllBenchmarkReturns } from '../services/index-history.service'

export const getLtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const raw = req.query.symbols as string
  if (!raw) throw new AppError(400, 'symbols query param required')

  const symbols = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 50)
  if (!symbols.length) throw new AppError(400, 'No valid symbols provided')

  const result = await fetchLtp(symbols)
  res.json(result)
})

export const getIndices = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.json({ data: INDICES.map(({ key, label }) => ({ key, label })) })
})

export const getIndexSectorAllocationHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const index = req.query.index as string
  if (!INDICES.some(i => i.key === index)) throw new AppError(400, 'Invalid or missing index query param')

  const data = getIndexSectorAllocation(index as IndexKey)
  res.json({ data })
})

export const getBenchmarkReturns = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const data = await getAllBenchmarkReturns()
  res.json({ data })
})
