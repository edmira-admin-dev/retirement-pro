import { Request } from 'express'

export interface AuthPayload {
  userId: string
  email: string
}

export interface AuthRequest extends Request {
  user?: AuthPayload
}

export interface Badge {
  id: string
  name: string
  description: string
  earnedAt: string | null
}

export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  error: string
}
