import { Stethoscope, Zap } from 'lucide-react'
import { memo } from 'react'

interface Props {
  name: string
  streak: number
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export const OpdHero = memo(function OpdHero({ name, streak }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-theme-card border border-theme-border px-6 py-5">
      {/* Background grid decoration */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--theme-primary) 1px, transparent 1px), linear-gradient(90deg, var(--theme-primary) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Green glow top-right */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-52 h-52 rounded-full bg-theme-primary/10 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-0.5">
            <Stethoscope size={15} className="text-theme-primary" />
            <span className="text-xs font-semibold text-theme-primary uppercase tracking-[0.12em]">
              Financial Snapshot
            </span>
          </div>
          <h1 className="text-xl font-bold text-theme-text leading-tight">
            {getGreeting()}, {name}
          </h1>
          <p className="text-xs text-theme-muted">{formatDate()}</p>
        </div>

        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/20">
              <Zap size={13} className="text-warning fill-warning" />
              <span className="text-xs font-semibold text-warning">{streak} day streak</span>
            </div>
          )}
          <div className="hidden sm:block h-8 w-px bg-theme-border" />
          <p className="hidden sm:block text-xs text-theme-muted italic">
            Your prescription for financial fitness
          </p>
        </div>
      </div>
    </div>
  )
})
