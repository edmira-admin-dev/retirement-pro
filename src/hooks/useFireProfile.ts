import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { toRupees, toPaise } from '../utils/money'
import type {
  FireInputs,
  ExtendedFireInputs,
  ExpenseCategory,
  IncomeInputs,
  AssetAllocation,
  LiabilityItem,
  NpsInputs,
  RetirementAssumptions,
} from '../types/fire'

export const FIRE_QUERY_KEY = ['fire-profile'] as const

interface ApiFireProfile {
  id: string
  currentAge: number
  retirementAge: number
  lifeExpectancy: number
  currentMonthlyExpense: number // paise
  medicalMonthlyExpense: number // paise
  lifestyleBuffer: number
  expectedReturnPre: number
  expectedReturnPost: number
  // Extended
  generalInflation?: number
  medicalInflation?: number
  withdrawalRate?: number
  expenseCategories?: ExpenseCategory[] | null
  incomeInputs?: IncomeInputs | null
  assetAllocation?: AssetAllocation | null
  liabilities?: LiabilityItem[] | null
  npsInputs?: NpsInputs | null
}

function mapProfile(p: ApiFireProfile): ExtendedFireInputs {
  const base: FireInputs = {
    currentAge: p.currentAge,
    retirementAge: p.retirementAge,
    lifeExpectancy: p.lifeExpectancy,
    currentMonthlyExpense: toRupees(p.currentMonthlyExpense),
    medicalMonthlyExpense: toRupees(p.medicalMonthlyExpense),
    lifestyleBuffer: p.lifestyleBuffer,
    expectedReturnPre: p.expectedReturnPre,
    expectedReturnPost: p.expectedReturnPost,
  }

  const assumptions: RetirementAssumptions = {
    withdrawalRate: p.withdrawalRate ?? 3.5,
    generalInflation: p.generalInflation ?? 6,
    medicalInflation: p.medicalInflation ?? 10,
  }

  // Convert paise → ₹ for monetary JSON fields
  const expenses: ExpenseCategory[] | null = p.expenseCategories
    ? p.expenseCategories.map(e => ({ ...e, monthlyAmount: toRupees(e.monthlyAmount) }))
    : null

  const income: IncomeInputs | null = p.incomeInputs
    ? {
        ...p.incomeInputs,
        currentMonthlySalary: toRupees(p.incomeInputs.currentMonthlySalary),
        monthlyRentalIncome: toRupees(p.incomeInputs.monthlyRentalIncome),
        monthlyDividendIncome: toRupees(p.incomeInputs.monthlyDividendIncome),
        postRetirementPartTimeMonthly: toRupees(p.incomeInputs.postRetirementPartTimeMonthly),
      }
    : null

  const liabilities: LiabilityItem[] | null = p.liabilities
    ? p.liabilities.map(l => ({
        ...l,
        emiMonthly: toRupees(l.emiMonthly),
        outstandingPrincipal: toRupees(l.outstandingPrincipal),
      }))
    : null

  const nps: NpsInputs | null = p.npsInputs
    ? {
        ...p.npsInputs,
        npsCorpusToday: toRupees(p.npsInputs.npsCorpusToday),
        npsMonthlyContribution: toRupees(p.npsInputs.npsMonthlyContribution),
      }
    : null

  return {
    base,
    expenses,
    income,
    allocation: p.assetAllocation ?? null,
    liabilities,
    assumptions,
    nps,
    goalDeductions: null, // populated by CalculatorPage from useGoals
  }
}

export function useFireProfile() {
  return useQuery({
    queryKey: FIRE_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ data: ApiFireProfile | null }>('/fire')
      return data.data ? mapProfile(data.data) : null
    },
  })
}

export function useSaveFireProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (inputs: FireInputs) => {
      const { data } = await api.put<{ data: ApiFireProfile }>('/fire', {
        ...inputs,
        currentMonthlyExpense: toPaise(inputs.currentMonthlyExpense),
        medicalMonthlyExpense: toPaise(inputs.medicalMonthlyExpense),
      })
      return mapProfile(data.data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FIRE_QUERY_KEY }),
  })
}

export function useSaveExtendedFireProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (extended: ExtendedFireInputs) => {
      const { base, expenses, income, allocation, liabilities, assumptions, nps } = extended

      const payload = {
        // Base fields
        ...base,
        currentMonthlyExpense: toPaise(base.currentMonthlyExpense),
        medicalMonthlyExpense: toPaise(base.medicalMonthlyExpense),
        // Assumption scalars
        generalInflation: assumptions?.generalInflation,
        medicalInflation: assumptions?.medicalInflation,
        withdrawalRate: assumptions?.withdrawalRate,
        // JSON blobs — convert monetary values back to paise
        expenseCategories: expenses
          ? expenses.map(e => ({ ...e, monthlyAmount: toPaise(e.monthlyAmount) }))
          : null,
        incomeInputs: income
          ? {
              ...income,
              currentMonthlySalary: toPaise(income.currentMonthlySalary),
              monthlyRentalIncome: toPaise(income.monthlyRentalIncome),
              monthlyDividendIncome: toPaise(income.monthlyDividendIncome),
              postRetirementPartTimeMonthly: toPaise(income.postRetirementPartTimeMonthly),
            }
          : null,
        assetAllocation: allocation,
        liabilities: liabilities
          ? liabilities.map(l => ({
              ...l,
              emiMonthly: toPaise(l.emiMonthly),
              outstandingPrincipal: toPaise(l.outstandingPrincipal),
            }))
          : null,
        npsInputs: nps
          ? {
              ...nps,
              npsCorpusToday: toPaise(nps.npsCorpusToday),
              npsMonthlyContribution: toPaise(nps.npsMonthlyContribution),
            }
          : null,
      }

      const { data } = await api.put<{ data: ApiFireProfile }>('/fire', payload)
      return mapProfile(data.data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FIRE_QUERY_KEY }),
  })
}
