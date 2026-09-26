import { Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import { AppError } from '../middleware/errorHandler'
import * as svc from '../services/taxpnl.service'

export const save = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { broker, realizedPnl, dividends, charges, holdings } = req.body
  if (!broker) throw new AppError(400, 'broker is required')
  if (!Array.isArray(realizedPnl)) throw new AppError(400, 'realizedPnl must be an array')

  const result = await svc.saveTaxPnl(req.user!.userId, {
    broker,
    realizedPnl: realizedPnl ?? [],
    dividends: dividends ?? [],
    charges: charges ?? [],
    holdings: holdings ?? [],
  })
  res.json({ data: result })
})

export const getData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const broker = (req.query.broker as string)?.toUpperCase()
  if (!broker) throw new AppError(400, 'broker query param is required')
  const data = await svc.getTaxPnlData(req.user!.userId, broker)
  res.json({ data })
})

export const deleteData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const broker = (req.query.broker as string)?.toUpperCase()
  if (!broker) throw new AppError(400, 'broker query param is required')
  const result = await svc.deleteBrokerData(req.user!.userId, broker)
  res.json({ data: result })
})

export const getAllHoldings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const broker = req.query.broker as string | undefined
  const data = await svc.getAllHoldings(req.user!.userId, broker?.toUpperCase())
  res.json({ data })
})

export const getSymbolSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const broker = req.query.broker as string | undefined
  const [symbols, charges] = await Promise.all([
    svc.getSymbolSummary(req.user!.userId, broker),
    svc.getChargesSummary(req.user!.userId, broker),
  ])
  res.json({ data: { symbols, charges } })
})

export const getExitedSymbols = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await svc.getExitedSymbols(req.user!.userId)
  res.json({ data })
})

export const getBrokers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const brokers = await svc.getBrokers(req.user!.userId)
  res.json({ data: brokers })
})
