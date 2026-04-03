import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { auth } from '../middleware/auth'
import * as holdingsController from '../controllers/holdings.controller'

const router = Router()

const AssetClassEnum = z.enum(['MF', 'NPS', 'EPF', 'PPF', 'STOCK'])

const CreateHoldingSchema = z.object({
  name: z.string().min(1).max(200),
  assetClass: AssetClassEnum,
  currentValue: z.number().int().min(0),
  investedValue: z.number().int().min(0),
  units: z.number().positive().optional(),
  nav: z.number().positive().optional(),
  notes: z.string().max(1000).optional(),
})

const UpdateHoldingSchema = CreateHoldingSchema.partial()

router.get('/', auth, holdingsController.list)
router.post('/', auth, validate(CreateHoldingSchema), holdingsController.create)
router.patch('/:id', auth, validate(UpdateHoldingSchema), holdingsController.update)
router.delete('/:id', auth, holdingsController.remove)

export default router
