import type { Scenario } from '../../utils/projectionCalc'

interface ScenarioConfig {
  id: Scenario
  label: string
  color: string
}

const SCENARIOS: ScenarioConfig[] = [
  { id: 'conservative', label: 'Conservative', color: '#f59e0b' },
  { id: 'base',         label: 'Base',         color: '#22c55e' },
  { id: 'optimistic',   label: 'Optimistic',   color: '#38bdf8' },
]

interface Props {
  active: Scenario[]
  onChange: (active: Scenario[]) => void
}

export function ScenarioToggle({ active, onChange }: Props) {
  const toggle = (id: Scenario) => {
    if (active.includes(id)) {
      if (active.length === 1) return // keep at least one
      onChange(active.filter(s => s !== id))
    } else {
      onChange([...active, id])
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-theme-muted mr-1">Scenarios:</span>
      {SCENARIOS.map(s => {
        const isActive = active.includes(s.id)
        return (
          <button
            key={s.id}
            onClick={() => toggle(s.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
              border transition-all cursor-pointer
              ${isActive
                ? 'border-transparent text-white-DEFAULT'
                : 'border-theme-border text-theme-muted bg-transparent hover:border-text-muted'
              }
            `}
            style={isActive ? { backgroundColor: s.color } : {}}
            aria-pressed={isActive}
            aria-label={`Toggle ${s.label} scenario`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.7)' : s.color }}
            />
            {s.label}
          </button>
        )
      })}
    </div>
  )
}
