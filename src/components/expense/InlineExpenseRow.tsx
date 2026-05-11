import { useState } from 'react'
import {
  Home, Zap, Droplet, Flame, Wifi, ShoppingCart, ChefHat, Car, Star, Shield, Repeat,
  Utensils, Bus, Activity, Tv, ShoppingBag, BookOpen, Plane, TrendingUp,
  Building, User, CreditCard, MoreHorizontal,
} from 'lucide-react'
import type { ExpenseType, ExpenseCategory } from '../../types/expense'
import type { ExpensePayload } from '../../hooks/useExpenses'
import { toPaise, rupeesToWords } from '../../utils/money'

const ICONS: Record<ExpenseCategory, React.ElementType> = {
  RENT: Home, ELECTRICITY: Zap, WATER: Droplet, GAS: Flame, INTERNET: Wifi,
  GROCERY: ShoppingCart, COOK: ChefHat, DRIVER: Car, MAID: Star, INSURANCE: Shield,
  SUBSCRIPTIONS: Repeat, FIXED_OTHER: MoreHorizontal,
  FOOD: Utensils, TRANSPORT: Bus, HEALTHCARE: Activity, ENTERTAINMENT: Tv,
  SHOPPING: ShoppingBag, EDUCATION: BookOpen, TRAVEL: Plane, INVESTMENT: TrendingUp,
  DISC_OTHER: MoreHorizontal,
  HOME_LOAN_EMI: Building, CAR_LOAN_EMI: Car, PERSONAL_LOAN_EMI: User,
  EDUCATION_LOAN_EMI: BookOpen, CREDIT_CARD_EMI: CreditCard, LOAN_OTHER: MoreHorizontal,
}

export const CAT_LABELS: Record<ExpenseCategory, string> = {
  RENT: 'Rent', ELECTRICITY: 'Electricity', WATER: 'Water', GAS: 'Gas', INTERNET: 'Internet',
  GROCERY: 'Grocery', COOK: 'Cook', DRIVER: 'Driver', MAID: 'Maid', INSURANCE: 'Insurance',
  SUBSCRIPTIONS: 'Subscriptions', FIXED_OTHER: 'Other',
  FOOD: 'Food & Dining', TRANSPORT: 'Transport', HEALTHCARE: 'Healthcare',
  ENTERTAINMENT: 'Entertainment', SHOPPING: 'Shopping', EDUCATION: 'Education',
  TRAVEL: 'Travel', INVESTMENT: 'Investment', DISC_OTHER: 'Other',
  HOME_LOAN_EMI: 'Home Loan EMI', CAR_LOAN_EMI: 'Car Loan EMI', PERSONAL_LOAN_EMI: 'Personal Loan',
  EDUCATION_LOAN_EMI: 'Education Loan', CREDIT_CARD_EMI: 'Credit Card EMI', LOAN_OTHER: 'Other',
}

interface InlineExpenseRowProps {
  expenseType: ExpenseType
  category: ExpenseCategory
  onQuickSave: (payload: ExpensePayload, key: string) => void
  isPending: boolean
  isFlash: boolean
}

export function InlineExpenseRow({
  expenseType, category, onQuickSave, isPending, isFlash,
}: InlineExpenseRowProps) {
  const [amount, setAmount] = useState('')

  const Icon = ICONS[category]

  function parseAmt() { return parseFloat(amount.replace(/,/g, '')) || 0 }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    const parts = raw.split('.')
    const clean = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : raw
    if (clean === '' || clean === '.') { setAmount(clean); return }
    const intPart = clean.includes('.') ? clean.split('.')[0] : clean
    const decPart = clean.includes('.') ? '.' + (clean.split('.')[1] ?? '') : ''
    setAmount(Number(intPart).toLocaleString('en-IN') + decPart)
  }

  function save() {
    const amt = parseAmt()
    if (!amt || isPending) return
    onQuickSave({
      merchant: CAT_LABELS[category],
      amountPaise: toPaise(amt),
      expenseType,
      category,
      date: new Date().toISOString().slice(0, 10),
      recurring: false,
      notes: null,
    }, category)
  }

  function handleAmountBlur() {
    const num = parseAmt()
    if (num > 0) {
      save()
    } else {
      setAmount('')
    }
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2.5 min-h-[44px] transition-colors duration-300 ${isFlash ? 'bg-green-500/10' : ''}`}>
      <Icon size={14} className="text-theme-muted shrink-0" />
      <span className="flex-1 text-sm text-theme-text truncate">{CAT_LABELS[category]}</span>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-xs text-theme-muted font-medium">₹</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            onBlur={handleAmountBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') save() }}
            placeholder="0"
            aria-label={`Amount for ${CAT_LABELS[category]}`}
            className="w-24 text-right bg-theme-bg-alt border border-theme-border rounded-lg px-2 py-1 text-sm font-mono text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-theme-primary"
          />
        </div>
        {parseAmt() > 0 && (
          <span className="text-[10px] text-theme-primary font-medium leading-tight pr-0.5">{rupeesToWords(parseAmt())}</span>
        )}
      </div>
    </div>
  )
}
