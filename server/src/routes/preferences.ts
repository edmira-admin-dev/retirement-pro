import { Router } from 'express'
import { z } from 'zod'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import * as controller from '../controllers/preferences.controller'

const router = Router()

const MonthField = z.string().regex(/^\d{4}-\d{2}$/).nullable().optional()

const PatchSchema = z.object({
  expenseViewMonth: MonthField,
  incomeViewMonth: MonthField,
})

router.get('/', auth, controller.getPreferences)
router.patch('/', auth, validate(PatchSchema), controller.patchPreferences)

export default router
