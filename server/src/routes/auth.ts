import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { auth } from '../middleware/auth'
import { authLimiter } from '../middleware/rateLimiter'
import * as authController from '../controllers/auth.controller'

const router = Router()

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
})

router.post('/register', authLimiter, validate(RegisterSchema), authController.register)
router.post('/login', authLimiter, validate(LoginSchema), authController.login)
router.post('/refresh', validate(RefreshSchema), authController.refreshToken)
router.post('/logout', auth, authController.logout)

export default router
