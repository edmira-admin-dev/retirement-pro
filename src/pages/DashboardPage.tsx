import { useMemo } from 'react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { useHoldings } from '../hooks/useHoldings'
import { useFireProfile } from '../hooks/useFireProfile'
import { useHealthProfile } from '../hooks/useHealthProfile'
import { useGamification } from '../hooks/useGamification'
import { useNetWorthHistory } from '../hooks/useNetWorthHistory'
import { computeFireResult } from '../utils/fireCalc'
import { computeHealthResult } from '../utils/healthCalc'
import { useAuthStore } from '../stores/authStore'
import { OpdHero } from '../components/dashboard/OpdHero'
import { FitnessScoreCard } from '../components/dashboard/FitnessScoreCard'
import { FireProgressCard } from '../components/dashboard/FireProgressCard'
import { PillarMiniGrid } from '../components/dashboard/PillarMiniGrid'
import { FeatureNavGrid } from '../components/dashboard/FeatureNavGrid'
import { BadgeSummary } from '../components/dashboard/BadgeSummary'
import { NetWorthChart } from '../components/dashboard/NetWorthChart'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: holdings = [] } = useHoldings()
  const { data: fireProfile } = useFireProfile()
  const { data: healthProfile } = useHealthProfile()
  const { data: gamData } = useGamification()
  const { data: networthHistory = [] } = useNetWorthHistory()

  const netWorth = useMemo(
    () => holdings.reduce((sum, h) => sum + h.currentValue, 0),
    [holdings],
  )

  const fireResult = useMemo(
    () => (fireProfile?.base ? computeFireResult(fireProfile.base, netWorth) : null),
    [fireProfile, netWorth],
  )

  const healthResult = useMemo(
    () => (healthProfile ? computeHealthResult(healthProfile, netWorth) : null),
    [healthProfile, netWorth],
  )

  const emailPrefix = user?.email.split('@')[0] ?? 'there'
  const displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)

  return (
    <PageWrapper>
      <div className="flex flex-col gap-5">
        <OpdHero name={displayName} streak={gamData?.streakDays ?? 0} />

        {/* Score + FIRE Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FitnessScoreCard
            score={healthResult?.overallScore ?? 0}
            status={healthResult?.status ?? null}
            recommendations={healthResult?.recommendations ?? []}
            hasProfile={healthProfile != null}
          />
          <FireProgressCard
            netWorth={netWorth}
            fireResult={fireResult}
            hasProfile={fireProfile != null}
          />
        </div>

        {/* Health Pillars — only when data available */}
        {healthResult && <PillarMiniGrid pillars={healthResult.pillars} />}

        {/* Net Worth Timeline */}
        <NetWorthChart data={networthHistory} />

        {/* Feature navigation */}
        <FeatureNavGrid />

        {/* Badges & streak */}
        {gamData && (
          <BadgeSummary badges={gamData.badges} streak={gamData.streakDays} />
        )}
      </div>
    </PageWrapper>
  )
}
