import { Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import * as goalsService from '../services/goals.service'

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const goals = await goalsService.list(req.user!.userId)
  res.json({ data: goals })
})

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const goal = await goalsService.create(req.user!.userId, req.body)
  res.status(201).json({ data: goal })
})

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string
  const goal = await goalsService.update(req.user!.userId, id, req.body)
  res.json({ data: goal })
})

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params['id'] as string
  await goalsService.remove(req.user!.userId, id)
  res.status(204).send()
})
