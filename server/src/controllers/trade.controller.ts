import { Response } from 'express'
import { z } from 'zod'
import { Exchange, Segment, TradeType, TradeSource } from '@prisma/client'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import * as tradeService from '../services/trade.service'

const ExchangeEnum = z.nativeEnum(Exchange)
const SegmentEnum = z.nativeEnum(Segment)
const TradeTypeEnum = z.nativeEnum(TradeType)

const DateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

const TradeBodySchema = z.object({
  symbol: z.string().min(1).max(30),
  exchange: ExchangeEnum,
  segment: SegmentEnum,
  tradeType: TradeTypeEnum,
  quantity: z.number().int().positive(),
  pricePaise: z.number().int().positive(),
  date: DateStr,
  brokeragePaise: z.number().int().min(0).optional(),
  notes: z.string().max(500).nullable().optional(),
  importedFrom: z.nativeEnum(TradeSource).optional(),
})

const BatchOrSingleSchema = z.union([TradeBodySchema, z.array(TradeBodySchema).min(1)])

const UpdateSchema = TradeBodySchema.partial()

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const symbol = z.string().optional().parse(req.query['symbol'])
  const segment = SegmentEnum.optional().parse(req.query['segment'])
  const from = DateStr.optional().parse(req.query['from'])
  const to = DateStr.optional().parse(req.query['to'])
  const trades = await tradeService.list(req.user!.userId, symbol, segment, from, to)
  res.json({ data: trades })
})

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = BatchOrSingleSchema.parse(req.body)
  if (Array.isArray(parsed)) {
    const result = await tradeService.createBatch(req.user!.userId, parsed)
    res.status(201).json({ data: result })
  } else {
    const trade = await tradeService.createSingle(req.user!.userId, parsed)
    res.status(201).json({ data: trade })
  }
})

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string
  const data = UpdateSchema.parse(req.body)
  const trade = await tradeService.update(req.user!.userId, id, data)
  res.json({ data: trade })
})

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string
  await tradeService.remove(req.user!.userId, id)
  res.status(204).send()
})

export const getPositions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await tradeService.positions(req.user!.userId)
  res.json({ data })
})

export const getPnl = asyncHandler(async (req: AuthRequest, res: Response) => {
  const from = DateStr.optional().parse(req.query['from'])
  const to = DateStr.optional().parse(req.query['to'])
  const data = await tradeService.pnlSummary(req.user!.userId, from, to)
  res.json({ data })
})

export const updateLtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const symbol = (req.params['symbol'] as string).toUpperCase()
  const { ltpPaise } = z.object({ ltpPaise: z.number().int().min(0) }).parse(req.body)
  const data = await tradeService.updateLtp(req.user!.userId, symbol, ltpPaise)
  res.json({ data })
})
