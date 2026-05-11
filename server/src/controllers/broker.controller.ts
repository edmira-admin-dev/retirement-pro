import { Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import * as brokerService from '../services/broker.service'

const BrokerSlugSchema = z.enum(['KITE', 'GROWW', 'ANGELONE', 'HDFC_SKY'])

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const connections = await brokerService.list(req.user!.userId)
  res.json({ data: connections })
})

export const disconnect = asyncHandler(async (req: AuthRequest, res: Response) => {
  const broker = BrokerSlugSchema.parse(req.params['broker'])
  const result = await brokerService.disconnect(req.user!.userId, broker)
  res.json({ data: result })
})
