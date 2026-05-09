import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { SliderInput } from '../SliderInput'
import { RupeeField } from '../RupeeField'
import { formatRupeesCompact } from '../../../utils/money'
import { projectNps } from '../../../utils/fireSimulation'
import type { AssetAllocation, NpsInputs } from '../../../types/fire'

const DEFAULT_ALLOCATION: AssetAllocation = { equityPct: 60, debtPct: 30, goldPct: 10 }
const DEFAULT_NPS: NpsInputs = { npsCorpusToday: 0, npsMonthlyContribution: 5000, npsFundReturnRate: 10 }

interface PortfolioTabProps {
  allocation: AssetAllocation | null
  nps: NpsInputs | null
  currentAge: number
  onAllocationChange: (a: AssetAllocation | null) => void
  onNpsChange: (n: NpsInputs | null) => void
  onBlur: () => void
}

export const PortfolioTab = ({
  allocation,
  nps,
  currentAge,
  onAllocationChange,
  onNpsChange,
  onBlur,
}: PortfolioTabProps) => {
  const alloc = allocation ?? DEFAULT_ALLOCATION
  const npsData = nps ?? DEFAULT_NPS
  const npsEnabled = nps !== null

  const setAlloc = (key: keyof AssetAllocation, val: number) => {
    const others = Object.entries(alloc).filter(([k]) => k !== key)
    const remaining = 100 - val
    const sumOthers = others.reduce((s, [, v]) => s + (v as number), 0)
    const ratio = sumOthers > 0 ? remaining / sumOthers : 0.5
    const updated = { ...alloc, [key]: val } as AssetAllocation
    others.forEach(([k]) => {
      updated[k as keyof AssetAllocation] = Math.max(
        0,
        Math.round((alloc[k as keyof AssetAllocation] as number) * ratio),
      )
    })
    // Normalize to ensure sum === 100
    const total = updated.equityPct + updated.debtPct + updated.goldPct
    if (total !== 100) updated.goldPct += 100 - total
    onAllocationChange(updated)
  }

  const npsProjection = npsEnabled ? projectNps(npsData, currentAge) : null

  const pieData = [
    { name: 'Equity', value: alloc.equityPct, color: 'var(--theme-primary)' },
    { name: 'Debt', value: alloc.debtPct, color: 'var(--theme-border)' },
    { name: 'Gold', value: alloc.goldPct, color: '#f59e0b' },
  ]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-theme-muted uppercase tracking-wider">Asset Allocation</p>

      <div className="flex items-center gap-4">
        <div className="w-24 h-24 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius="55%" outerRadius="90%" paddingAngle={2}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: unknown) => `${Number(v)}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-1 text-xs text-theme-muted">
          {pieData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
              <span>{d.name}: {d.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <SliderInput label="Equity %" value={alloc.equityPct} min={0} max={100} onChange={(v) => setAlloc('equityPct', v)} onBlur={onBlur} unit="%" />
      <SliderInput label="Debt %" value={alloc.debtPct} min={0} max={100} onChange={(v) => setAlloc('debtPct', v)} onBlur={onBlur} unit="%" />
      <SliderInput label="Gold %" value={alloc.goldPct} min={0} max={100} onChange={(v) => setAlloc('goldPct', v)} onBlur={onBlur} unit="%" />

      <div className="h-px bg-theme-border" />

      <div className="flex items-center justify-between">
        <p className="text-xs text-theme-muted uppercase tracking-wider">NPS (National Pension)</p>
        <button
          onClick={() => onNpsChange(npsEnabled ? null : DEFAULT_NPS)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${npsEnabled ? 'bg-theme-primary text-white' : 'bg-theme-bg-alt text-theme-muted hover:text-theme-text'}`}
        >
          {npsEnabled ? 'Enabled' : 'Off'}
        </button>
      </div>

      {npsEnabled && (
        <>
          <RupeeField label="NPS corpus today" value={npsData.npsCorpusToday} onChange={(v) => onNpsChange({ ...npsData, npsCorpusToday: v })} onBlur={onBlur} />
          <RupeeField label="Monthly contribution" value={npsData.npsMonthlyContribution} onChange={(v) => onNpsChange({ ...npsData, npsMonthlyContribution: v })} onBlur={onBlur} />
          <SliderInput label="Fund return rate" value={npsData.npsFundReturnRate} min={6} max={14} step={0.5} unit="% pa" onChange={(v) => onNpsChange({ ...npsData, npsFundReturnRate: v })} onBlur={onBlur} />
          {npsProjection && currentAge < 60 && (
            <div className="bg-theme-bg-alt rounded-lg p-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-theme-muted">Lumpsum @ 60</p>
                <p className="text-sm font-semibold text-theme-text">{formatRupeesCompact(npsProjection.lumpsumAt60)}</p>
              </div>
              <div>
                <p className="text-xs text-theme-muted">Monthly annuity</p>
                <p className="text-sm font-semibold text-theme-text">{formatRupeesCompact(npsProjection.monthlyAnnuity)}/mo</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
