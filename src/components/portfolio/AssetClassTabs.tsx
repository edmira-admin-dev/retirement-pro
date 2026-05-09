import { useState } from 'react'
import { Package } from 'lucide-react'
import { HoldingCard } from './HoldingCard'
import type { Holding } from '../../types/holdings'

interface Tab {
  id: string
  label: string
  filter: (h: Holding) => boolean
}

const TABS: Tab[] = [
  { id: 'all',     label: 'All',         filter: () => true },
  { id: 'equity',  label: 'Equity',      filter: (h) => ['STOCK', 'ETF', 'MF'].includes(h.assetClass) },
  { id: 'debt',    label: 'Debt',        filter: (h) => ['FD', 'BOND', 'LIQUID'].includes(h.assetClass) },
  { id: 'retire',  label: 'Retirement',  filter: (h) => ['NPS', 'EPF', 'PPF', 'ANNUITY'].includes(h.assetClass) },
  { id: 'real',    label: 'Real Assets', filter: (h) => ['GOLD', 'REAL_ESTATE'].includes(h.assetClass) },
  { id: 'bank',    label: 'Cash',        filter: (h) => h.assetClass === 'BANK' },
  { id: 'intl',    label: 'Global',      filter: (h) => ['INTL_EQUITY', 'INTL_DEBT'].includes(h.assetClass) },
]

interface AssetClassTabsProps {
  holdings: Holding[]
}

export function AssetClassTabs({ holdings }: AssetClassTabsProps) {
  const [activeTab, setActiveTab] = useState('all')
  const tab = TABS.find((t) => t.id === activeTab) ?? TABS[0]
  const filtered = holdings.filter(tab.filter)

  return (
    <div>
      <div className="flex gap-0 border-b border-theme-border mb-4 overflow-x-auto scrollbar-thin">
        {TABS.map((t) => {
          const count = holdings.filter(t.filter).length
          if (t.id !== 'all' && count === 0) return null
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={[
                'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer focus-visible:outline-none',
                t.id === activeTab
                  ? 'border-theme-primary text-theme-primary'
                  : 'border-transparent text-theme-muted hover:text-theme-text',
              ].join(' ')}
            >
              {t.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  t.id === activeTab
                    ? 'bg-theme-primary/15 text-theme-primary'
                    : 'bg-theme-border text-theme-muted'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Package size={32} className="text-theme-muted opacity-40" />
          <p className="text-sm text-theme-muted">
            {activeTab === 'all' ? 'No holdings yet' : `No ${tab.label} holdings`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((holding) => (
            <HoldingCard key={holding.id} holding={holding} />
          ))}
        </div>
      )}
    </div>
  )
}
