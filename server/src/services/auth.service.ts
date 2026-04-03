import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma'
import { env } from '../config/env'
import { AppError } from '../middleware/errorHandler'
import { AuthPayload } from '../types'

const SALT_ROUNDS = 12
const ACCESS_EXPIRES = '15m'
const REFRESH_EXPIRES = '7d'
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000

function generateAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_EXPIRES })
}

function generateRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_EXPIRES })
}

export async function register(email: string, password: string) {
  const existing = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  })
  if (existing) {
    throw new AppError(409, 'Email already registered')
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true, createdAt: true },
  })

  const payload: AuthPayload = { userId: user.id, email: user.email }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
    },
  })

  return { accessToken, refreshToken, user }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  })
  if (!user) {
    throw new AppError(401, 'Invalid credentials')
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw new AppError(401, 'Invalid credentials')
  }

  const payload: AuthPayload = { userId: user.id, email: user.email }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
    },
  })

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
  }
}

export async function refresh(token: string) {
  let payload: AuthPayload
  try {
    payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as AuthPayload
  } catch {
    throw new AppError(401, 'Invalid refresh token')
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } })
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh token expired or revoked')
  }

  const accessToken = generateAccessToken({ userId: payload.userId, email: payload.email })
  return { accessToken }
}

export async function logout(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } })
}
