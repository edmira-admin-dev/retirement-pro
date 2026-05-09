import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplets, Wallet, TrendingUp, CreditCard, Scale, Shield } from 'lucide-react'
import type { PillarScore } from '../../types/health'

interface Props {
  pillars: PillarScore[]
}

const PILLAR_META: Array<{ icon: React.ElementType; color: string; bg: string }> = [
  { icon: Droplets,   color: 'text-sky-400',    bg: 'bg-sky-400/10'    },
  { icon: Wallet,     color: 'text-violet-400',  bg: 'bg-violet-400/10' },
  { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10'},
  { icon: CreditCard, color: 'text-amber-400',   bg: 'bg-amber-400/10'  },
  { icon: Scale,      color: 'text-cyan-400',    bg: 'bg-cyan-400/10'   },
  { icon: Shield,     color: 'text-rose-400',    bg: 'bg-rose-400/10'   },
]

const PillarCard = memo(function PillarCard({
  pillar, meta,
}: {
  pillar: PillarScore
  meta: typeof PILLAR_META[number]
}) {
  const Icon = meta.icon
  const scoreColor = pillar.score >= 70
    ? 'text-theme-primary'
    : pillar.score >= 40 ? 'text-warning' : 'text-danger'

  return (
    <div className="flex flex-col gap-2 bg-theme-card border border-theme-border rounded-xl p-3.5 hover:border-theme-border/70 transition-colors">
      <div className="flex items-center justify-between">
        <div className={`w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center`}>
          <Icon size={13} className={meta.color} />
        </div>
        <span className={`text-xs font-bold font-mono ${scoreColor}`}>{pillar.score}</span>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-theme-text leading-none">{pillar.name}</p>
        <div className="mt-1.5 h-1 w-full rounded-full bg-theme-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pillar.score}%`,
              backgroundColor: pillar.score >= 70 ? '#22c55e' : pillar.score >= 40 ? '#f59e0b' : '#ef4444',
            }}
          />
        </div>
      </div>
    </div>
  )
})

export const PillarMiniGrid = memo(function PillarMiniGrid({ pillars }: Props) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-theme-text">Financial Health Pillars</h2>
          <p className="text-xs text-theme-muted mt-0.5">Your 6-pillar diagnostic</p>
        </div>
        <button
          onClick={() => navigate('/health')}
          className="text-xs text-theme-primary hover:text-theme-primary-dark font-semibold transition-colors cursor-pointer"
        >
          Full report →
        </button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {pillars.slice(0, 6).map((pillar, i) => (
          <PillarCard key={pillar.name} pillar={pillar} meta={PILLAR_META[i]} />
        ))}
      </div>
    </div>
  )
})
