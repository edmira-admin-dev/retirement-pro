import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Flame, Activity, Target, Receipt, ArrowRight } from 'lucide-react'

interface FeatureCard {
  icon: React.ElementType
  iconColor: string
  iconBg: string
  title: string
  description: string
  path: string
  tag?: string
}

const FEATURES: FeatureCard[] = [
  {
    icon: PieChart,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-400/10',
    title: 'Portfolio',
    description: 'Track MF, NPS, EPF & stocks with live net worth',
    path: '/portfolio',
  },
  {
    icon: Flame,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-400/10',
    title: 'FIRE Calculator',
    description: 'Compute your corpus target and monthly SIP',
    path: '/calculator',
  },
  {
    icon: Activity,
    iconColor: 'text-sky-400',
    iconBg: 'bg-sky-400/10',
    title: 'Health Score',
    description: 'Diagnose your 6-pillar financial wellness',
    path: '/health',
  },
  {
    icon: Target,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-400/10',
    title: 'Goals',
    description: 'FIRE goal + milestone sub-goals with badge rewards',
    path: '/goals',
  },
  {
    icon: Receipt,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-400/10',
    title: 'Tax Alerts',
    description: 'LTCG harvesting and 3-bucket allocation alerts',
    path: '/portfolio',
    tag: 'New',
  },
]

const NavCard = memo(function NavCard({ card }: { card: FeatureCard }) {
  const navigate = useNavigate()
  const Icon = card.icon

  return (
    <button
      onClick={() => navigate(card.path)}
      className="group relative flex flex-col gap-3 bg-theme-card border border-theme-border rounded-xl p-4 text-left hover:border-theme-primary/40 hover:bg-theme-card/80 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
    >
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
          <Icon size={16} className={card.iconColor} />
        </div>
        <div className="flex items-center gap-1.5">
          {card.tag && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-theme-primary/15 text-theme-primary uppercase tracking-wider">
              {card.tag}
            </span>
          )}
          <ArrowRight
            size={13}
            className="text-theme-muted group-hover:text-theme-primary group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-theme-text">{card.title}</p>
        <p className="text-[11px] text-theme-muted mt-0.5 leading-relaxed">{card.description}</p>
      </div>
    </button>
  )
})

export const FeatureNavGrid = memo(function FeatureNavGrid() {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-bold text-theme-text">Your Financial Journey</h2>
        <p className="text-xs text-theme-muted mt-0.5">Navigate to any module</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {FEATURES.map((card) => (
          <NavCard key={card.title} card={card} />
        ))}
      </div>
    </div>
  )
})
