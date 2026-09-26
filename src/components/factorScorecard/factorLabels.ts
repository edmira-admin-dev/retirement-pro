import type { FactorReasoning } from '../../hooks/useFactorScorecard'

export const FACTOR_LABELS: { key: keyof FactorReasoning; label: string; field: 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8' | 'f9' | 'f10' }[] = [
  { key: 'moat',      label: 'Moat',       field: 'f1'  },
  { key: 'financial', label: 'Financial',  field: 'f2'  },
  { key: 'growth',    label: 'Growth',     field: 'f3'  },
  { key: 'valuation', label: 'Valuation',  field: 'f4'  },
  { key: 'mgmt',      label: 'Mgmt',       field: 'f5'  },
  { key: 'earnings',  label: 'Earnings',   field: 'f6'  },
  { key: 'macro',     label: 'Macro',      field: 'f7'  },
  { key: 'risk',      label: 'Risk',       field: 'f8'  },
  { key: 'dividend',  label: 'Dividend',   field: 'f9'  },
  { key: 'liquidity', label: 'Liquidity',  field: 'f10' },
]

export function recommendationBadgeCls(rec: string) {
  const r = rec.toUpperCase()
  if (r.includes('AVOID')) return 'bg-red-100 text-red-700'
  if (r.includes('UNDERWEIGHT')) return 'bg-amber-100 text-amber-700'
  if (r.includes('OVERWEIGHT')) return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-600'
}

export function universeLabel(u: string) {
  return u === 'NIFTY_MIDCAP150' ? 'Nifty Midcap 150' : 'Nifty 100'
}

// Source xlsx reasoning text is pre-fixed with "[8/10] ..." — the score already renders
// as its own badge, so strip the duplicate prefix before showing the paragraph.
export function stripScorePrefix(text: string) {
  return text.replace(/^\s*\[\s*\d+(\.\d+)?\s*\/\s*10\s*\]\s*/, '').trim()
}

export function scoreTierCls(score: number) {
  if (score >= 7) return 'bg-green-100 text-green-700'
  if (score >= 4) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-700'
}

export function providerLabel(p: string) {
  if (p === 'OPENAI') return 'GPT-4o'
  if (p === 'GEMINI') return 'Gemini'
  if (p === 'CLAUDE') return 'Claude'
  return p
}
