import { TrendingUp, TrendingDown, CheckCircle, Heart, ShieldAlert, Wallet, Receipt } from 'lucide-react'
import { formatRupeesCompact, formatRupees } from '../../utils/money'
import { CorpusGauge } from './CorpusGauge'
import type { ExtendedFireResult } from '../../types/fire'

interface ResultPanelProps {
  result: ExtendedFireResult
  currentPortfolio: number
}

interface MetricCardProps {
  label: string
  value: string
  highlight?: boolean
  colorClass?: string
  icon?: React.ReactNode
}

function MetricCard({ label, value, highlight, colorClass, icon }: MetricCardProps) {
  const cls =
    colorClass ?? (highlight ? 'text-theme-primary' : 'text-theme-text')
  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-4">
      <p className="text-xs text-theme-muted mb-1.5">{label}</p>
      <div className="flex items-center gap-1.5">
        {icon && <span className={cls}>{icon}</span>}
        <p className={`text-base font-bold font-mono leading-none ${cls}`}>{value}</p>
      </div>
    </div>
  )
}

export const ResultPanel = ({ result, currentPortfolio }: ResultPanelProps) => {
  const {
    yearsToRetirement,
    effectiveCorpus,
    firstYearExpense,
    shortfallOrSurplus,
    monthlySipRequired,
    healthcareReserve,
    isFireAchieved,
    simulationYears,
    survivalAge,
    currentInvestableSurplus,
    requiredMonthlySavings,
    section80cUtilization,
    npsLumpsumAt60,
    npsAnnuityMonthly,
  } = result

  const hasExtended = simulationYears.length > 0

  return (
    <div className="flex flex-col gap-4">
      {isFireAchieved ? (
        <div className="bg-success/10 border border-success/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-success shrink-0" />
          <div>
            <p className="text-sm font-semibold text-success">FIRE Achieved!</p>
            <p className="text-xs text-theme-muted mt-0.5">
              Your portfolio has crossed the target corpus. You can retire today.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-theme-card border border-theme-border rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-theme-muted">Years to FIRE</p>
            <p className="text-4xl font-bold text-theme-text font-mono leading-none mt-1">
              {yearsToRetirement}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-theme-muted">Monthly SIP needed</p>
            <p className="text-2xl font-bold text-theme-primary font-mono leading-none mt-1">
              {formatRupeesCompact(monthlySipRequired)}
            </p>
          </div>
        </div>
      )}

      <CorpusGauge current={currentPortfolio} target={effectiveCorpus} />

      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Target Corpus"
          value={formatRupeesCompact(effectiveCorpus)}
          highlight
        />
        <MetricCard
          label="1st Year Expense"
          value={formatRupeesCompact(firstYearExpense)}
        />
        <MetricCard
          label={shortfallOrSurplus >= 0 ? 'Surplus' : 'Shortfall'}
          value={formatRupeesCompact(Math.abs(shortfallOrSurplus))}
          colorClass={shortfallOrSurplus >= 0 ? 'text-success' : 'text-danger'}
          icon={
            shortfallOrSurplus >= 0 ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )
          }
        />
        <MetricCard
          label="Current Portfolio"
          value={formatRupeesCompact(currentPortfolio)}
        />
      </div>

      <div className="bg-theme-card border border-theme-border rounded-xl p-4 flex items-start gap-3">
        <Heart size={16} className="text-danger shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-theme-text">Healthcare Reserve</p>
          <p className="text-xs text-theme-muted mt-1 leading-relaxed">
            Keep{' '}
            <span className="text-theme-text font-mono font-medium">
              {formatRupees(healthcareReserve)}
            </span>{' '}
            aside for medical emergencies — not in equity.
          </p>
        </div>
      </div>

      {hasExtended && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Corpus Survival Age"
              value={survivalAge ? `Age ${survivalAge}` : 'Fully funded'}
              colorClass={survivalAge ? 'text-danger' : 'text-success'}
              icon={<ShieldAlert size={14} />}
            />
            <MetricCard
              label="Investable Surplus / mo"
              value={formatRupeesCompact(currentInvestableSurplus / 12)}
              colorClass={
                currentInvestableSurplus / 12 >= requiredMonthlySavings
                  ? 'text-success'
                  : 'text-danger'
              }
              icon={<Wallet size={14} />}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Section 80C Used"
              value={`${formatRupeesCompact(section80cUtilization)} / ₹1.5L`}
              icon={<Receipt size={14} />}
            />
            {npsLumpsumAt60 > 0 && (
              <MetricCard
                label="NPS Lumpsum @ 60"
                value={formatRupeesCompact(npsLumpsumAt60)}
                highlight
              />
            )}
          </div>

          {npsAnnuityMonthly > 0 && (
            <div className="bg-theme-card border border-theme-border rounded-xl p-4">
              <p className="text-xs text-theme-muted mb-1">NPS Monthly Annuity (after 60)</p>
              <p className="text-lg font-bold font-mono text-theme-primary">
                {formatRupeesCompact(npsAnnuityMonthly)}/mo
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
