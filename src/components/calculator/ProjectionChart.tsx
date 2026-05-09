import { useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts'
import { ScenarioToggle } from './ScenarioToggle'
import {
  buildProjectionData,
  findDepletionAge,
  type Scenario,
} from '../../utils/projectionCalc'
import { formatRupeesCompact } from '../../utils/money'
import type { FireInputs, ExtendedFireResult } from '../../types/fire'

const SCENARIO_META: Record<Scenario, { label: string; color: string; gradient: string }> = {
  conservative: { label: 'Conservative (8%/6%)', color: '#f59e0b', gradient: 'gradConservative' },
  base:         { label: 'Base (your inputs)',    color: '#22c55e', gradient: 'gradBase' },
  optimistic:   { label: 'Optimistic (15%/10%)', color: '#38bdf8', gradient: 'gradOptimistic' },
}

function formatYAxis(value: number): string {
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(0)}Cr`
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(0)}L`
  return `₹${value}`
}

interface PayloadEntry {
  dataKey: string
  value: number
  payload: Record<string, number>
}

interface ChartTooltipProps {
  active?: boolean
  payload?: PayloadEntry[]
  label?: number
  retirementAge: number
}

function ChartTooltip({ active, payload, label, retirementAge }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const age = label ?? 0
  const phase = age < retirementAge ? 'Accumulation' : 'Distribution'

  return (
    <div className="bg-theme-card border border-theme-border rounded-lg p-3 text-xs shadow-xl min-w-[180px]">
      <p className="text-theme-text font-semibold mb-1">Age {age}</p>
      <p className="text-theme-muted mb-2">{phase} phase</p>
      {payload.map(entry => {
        if (entry.dataKey === 'target') return null
        const scenario = entry.dataKey as Scenario
        const meta = SCENARIO_META[scenario]
        if (!meta) return null
        return (
          <div key={scenario} className="flex justify-between gap-4 mb-0.5">
            <span style={{ color: meta.color }}>{meta.label.split(' ')[0]}</span>
            <span className="text-theme-text font-mono">
              {formatRupeesCompact(entry.value ?? 0)}
            </span>
          </div>
        )
      })}
      {payload[0] && (
        <div className="flex justify-between gap-4 mt-1 pt-1 border-t border-theme-border">
          <span className="text-theme-muted">Target</span>
          <span className="text-theme-text font-mono">
            {formatRupeesCompact(payload[0].payload?.target ?? 0)}
          </span>
        </div>
      )}
    </div>
  )
}

interface Props {
  inputs: FireInputs
  result: ExtendedFireResult
  currentPortfolio: number
}

export function ProjectionChart({ inputs, result, currentPortfolio }: Props) {
  const [activeScenarios, setActiveScenarios] = useState<Scenario[]>([
    'conservative',
    'base',
    'optimistic',
  ])

  const data = useMemo(
    () => buildProjectionData(inputs, currentPortfolio, result),
    [inputs, currentPortfolio, result],
  )

  const depletionAges = useMemo(() => ({
    conservative: findDepletionAge(data, 'conservative'),
    base:         findDepletionAge(data, 'base'),
    optimistic:   findDepletionAge(data, 'optimistic'),
  }), [data])

  const hasDepletion = Object.entries(depletionAges).some(
    ([s, age]) => age !== null && activeScenarios.includes(s as Scenario),
  )

  const { retirementAge, lifeExpectancy, currentAge } = inputs

  // Find first depletion for ReferenceArea shading
  const firstDepletionAge = (['conservative', 'base', 'optimistic'] as Scenario[])
    .filter(s => activeScenarios.includes(s))
    .reduce<number | null>((min, s) => {
      const age = depletionAges[s]
      if (age === null) return min
      return min === null ? age : Math.min(min, age)
    }, null)

  return (
    <div className="bg-theme-card rounded-xl border border-theme-border p-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-theme-text">Corpus Projection</h2>
          <p className="text-xs text-theme-muted mt-0.5">
            Age {currentAge} → {lifeExpectancy} · {lifeExpectancy - currentAge} year horizon
          </p>
        </div>
        <ScenarioToggle active={activeScenarios} onChange={setActiveScenarios} />
      </div>

      {hasDepletion && (
        <div className="flex items-center gap-2 bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-danger flex-shrink-0" />
          <p className="text-xs text-danger">
            Corpus depletion risk detected:{' '}
            {(['conservative', 'base', 'optimistic'] as Scenario[])
              .filter(s => depletionAges[s] !== null && activeScenarios.includes(s))
              .map(s => `${SCENARIO_META[s].label.split(' ')[0]} at age ${depletionAges[s]}`)
              .join(', ')}
          </p>
        </div>
      )}

      {/* Horizontal scroll container for mobile */}
      <div className="overflow-x-auto -mx-1">
        <div style={{ minWidth: 600 }} className="px-1">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <defs>
                {(Object.entries(SCENARIO_META) as [Scenario, typeof SCENARIO_META[Scenario]][]).map(
                  ([id, meta]) => (
                    <linearGradient key={id} id={meta.gradient} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={meta.color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={meta.color} stopOpacity={0.02} />
                    </linearGradient>
                  ),
                )}
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" vertical={false} />

              <XAxis
                dataKey="age"
                tick={{ fill: 'var(--theme-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--theme-border)' }}
                tickFormatter={v => `${v}`}
              />
              <YAxis
                tick={{ fill: 'var(--theme-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
                width={56}
              />

              <Tooltip
                content={<ChartTooltip retirementAge={retirementAge} />}
                cursor={{ stroke: '#475569', strokeWidth: 1 }}
              />

              {/* Accumulation zone (green bg) */}
              <ReferenceArea
                x1={currentAge}
                x2={retirementAge}
                fill="#22c55e"
                fillOpacity={0.04}
              />

              {/* Distribution zone (amber bg) */}
              <ReferenceArea
                x1={retirementAge}
                x2={lifeExpectancy}
                fill="#f59e0b"
                fillOpacity={0.04}
              />

              {/* Depletion zone (red bg) */}
              {firstDepletionAge !== null && (
                <ReferenceArea
                  x1={firstDepletionAge}
                  x2={lifeExpectancy}
                  fill="#ef4444"
                  fillOpacity={0.08}
                />
              )}

              {/* Retirement age marker */}
              <ReferenceLine
                x={retirementAge}
                stroke="var(--theme-muted)"
                strokeDasharray="4 3"
                label={{
                  value: 'Retire',
                  position: 'insideTopLeft',
                  fill: 'var(--theme-muted)',
                  fontSize: 10,
                }}
              />

              {/* Life expectancy marker */}
              <ReferenceLine
                x={lifeExpectancy}
                stroke="var(--theme-muted)"
                strokeDasharray="4 3"
                label={{
                  value: `Age ${lifeExpectancy}`,
                  position: 'insideTopRight',
                  fill: 'var(--theme-muted)',
                  fontSize: 10,
                }}
              />

              {/* Simulation survival age — from extended result */}
              {result.survivalAge !== null && (
                <ReferenceLine
                  x={result.survivalAge}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  strokeWidth={1.5}
                  label={{
                    value: `Depletes ${result.survivalAge}`,
                    position: 'insideTopLeft',
                    fill: '#ef4444',
                    fontSize: 10,
                  }}
                />
              )}

              {/* Target corpus — dashed flat line */}
              <ReferenceLine
                y={result.effectiveCorpus}
                stroke="#818cf8"
                strokeDasharray="6 3"
                strokeWidth={1.5}
                label={{
                  value: `Target ${formatRupeesCompact(result.effectiveCorpus)}`,
                  position: 'insideTopRight',
                  fill: '#818cf8',
                  fontSize: 10,
                }}
              />

              {/* Scenario areas */}
              {(Object.entries(SCENARIO_META) as [Scenario, typeof SCENARIO_META[Scenario]][]).map(
                ([id, meta]) =>
                  activeScenarios.includes(id) ? (
                    <Area
                      key={id}
                      type="monotone"
                      dataKey={id}
                      stroke={meta.color}
                      strokeWidth={2}
                      fill={`url(#${meta.gradient})`}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0, fill: meta.color }}
                      name={meta.label}
                    />
                  ) : null,
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Zone legend */}
      <div className="flex items-center gap-4 text-xs text-theme-muted flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-success/20 border border-success/30" />
          Accumulation
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-warning/20 border border-warning/30" />
          Distribution
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border border-dashed border-indigo-400/50" />
          Target corpus
        </span>
        {hasDepletion && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-danger/20 border border-danger/30" />
            Depletion risk
          </span>
        )}
      </div>
    </div>
  )
}
