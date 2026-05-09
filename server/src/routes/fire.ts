import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { auth } from '../middleware/auth'
import * as fireController from '../controllers/fire.controller'

const router = Router()

const ExpenseCategorySchema = z.object({
  label: z.string(),
  monthlyAmount: z.number().int().min(0),
  inflationRate: z.number().min(0).max(30),
})

const LiabilityItemSchema = z.object({
  label: z.string(),
  emiMonthly: z.number().int().min(0),
  interestRate: z.number().min(0).max(50),
  remainingMonths: z.number().int().min(0),
  outstandingPrincipal: z.number().int().min(0),
})

const FireProfileSchema = z.object({
  currentAge: z.number().int().min(18).max(80),
  retirementAge: z.number().int().min(30).max(80).optional(),
  lifeExpectancy: z.number().int().min(60).max(110).optional(),
  currentMonthlyExpense: z.number().int().min(0),
  medicalMonthlyExpense: z.number().int().min(0),
  lifestyleBuffer: z.number().min(0).max(100).optional(),
  expectedReturnPre: z.number().min(0).max(50).optional(),
  expectedReturnPost: z.number().min(0).max(50).optional(),
  // Extended
  generalInflation: z.number().min(0).max(20).optional(),
  medicalInflation: z.number().min(0).max(30).optional(),
  withdrawalRate: z.number().min(1).max(10).optional(),
  expenseCategories: z.array(ExpenseCategorySchema).optional().nullable(),
  incomeInputs: z.object({
    currentMonthlySalary: z.number().int().min(0),
    salaryGrowthRate: z.number().min(0).max(30),
    monthlyRentalIncome: z.number().int().min(0),
    monthlyDividendIncome: z.number().int().min(0),
    postRetirementPartTimeMonthly: z.number().int().min(0),
  }).optional().nullable(),
  assetAllocation: z.object({
    equityPct: z.number().min(0).max(100),
    debtPct: z.number().min(0).max(100),
    goldPct: z.number().min(0).max(100),
  }).optional().nullable(),
  liabilities: z.array(LiabilityItemSchema).optional().nullable(),
  npsInputs: z.object({
    npsCorpusToday: z.number().int().min(0),
    npsMonthlyContribution: z.number().int().min(0),
    npsFundReturnRate: z.number().min(0).max(30),
  }).optional().nullable(),
})

router.get('/', auth, fireController.get)
router.put('/', auth, validate(FireProfileSchema), fireController.upsert)

export default router
