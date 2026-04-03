import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { auth } from '../middleware/auth'
import * as gamificationController from '../controllers/gamification.controller'

const router = Router()

const BadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  earnedAt: z.string().nullable(),
})

const GamificationPatchSchema = z.object({
  badges: z.array(BadgeSchema).optional(),
  streakDays: z.number().int().min(0).optional(),
  lastVisitDate: z.string().optional(),
  dismissedNudges: z.array(z.string()).optional(),
}).partial()

router.get('/', auth, gamificationController.get)
router.patch('/', auth, validate(GamificationPatchSchema), gamificationController.patch)

export default router
