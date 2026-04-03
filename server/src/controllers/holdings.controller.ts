import { Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import * as holdingsService from '../services/holdings.service'

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const holdings = await holdingsService.list(req.user!.userId)
  res.json({ data: holdings })
})

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const holding = await holdingsService.create(req.user!.userId, req.body)
  res.status(201).json({ data: holding })
})

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string
  const holding = await holdingsService.update(req.user!.userId, id, req.body)
  res.json({ data: holding })
})

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string
  await holdingsService.remove(req.user!.userId, id)
  res.status(204).send()
})
