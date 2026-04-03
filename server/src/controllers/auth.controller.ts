import { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { AuthRequest } from '../types'
import * as authService from '../services/auth.service'

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string }
  const result = await authService.register(email, password)
  res.status(201).json({ data: result })
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string }
  const result = await authService.login(email, password)
  res.status(200).json({ data: result })
})

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string }
  if (!refreshToken) {
    res.status(400).json({ error: 'refreshToken is required' })
    return
  }
  const result = await authService.refresh(refreshToken)
  res.status(200).json({ data: result })
})

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string }
  if (refreshToken) {
    await authService.logout(refreshToken)
  }
  res.status(204).send()
})
