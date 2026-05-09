import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useEffect } from 'react'
import api from '../lib/api'
import { computeFireResult } from '../utils/fireCalc'
import { useHoldings } from './useHoldings'
import { useFireProfile } from './useFireProfile'
import { useHealthProfile } from './useHealthProfile'
import { useGoals } from './useGoals'
import { useGamificationUIStore } from '../stores/gamificationUIStore'
import type { Badge, GamificationData, GamificationPatch } from '../types/gamification'
import type { Holding } from '../types/holdings'
import type { ExtendedFireInputs } from '../types/fire'
import type { HealthInputs } from '../types/health'
import type { Goal } from '../types/goals'

export const GAMIFICATION_QUERY_KEY = ['gamification'] as const

export const BADGE_DEFS: Array<{
  id: string
  name: string
  description: string
  icon: string
  unlockHint: string
  category: Badge['category']
}> = [
  { id: 'first-holding',       name: 'First Step',           description: 'Added your first holding',              icon: 'Briefcase',  unlockHint: 'Add any holding to your portfolio',           category: 'portfolio'    },
  { id: 'triple-threat',       name: 'Triple Threat',        description: 'Holding MF, NPS & EPF together',        icon: 'Trophy',     unlockHint: 'Hold MF, NPS, and EPF simultaneously',        category: 'portfolio'    },
  { id: 'fire-starter',        name: 'FIRE Starter',         description: 'Set up your FIRE profile',              icon: 'Flame',      unlockHint: 'Save your inputs in the FIRE Calculator',     category: 'goals'        },
  { id: 'health-check',        name: 'Health Check',         description: 'Completed your health diagnostic',      icon: 'Heart',      unlockHint: 'Submit your Health Score inputs',             category: 'health'       },
  { id: 'goal-setter',         name: 'Goal Setter',          description: 'Created 3 or more milestone goals',     icon: 'Target',     unlockHint: 'Set at least 3 milestone goals',              category: 'goals'        },
  { id: 'corpus-10pct',        name: '10% There',            description: 'Portfolio at 10% of FIRE target',       icon: 'TrendingUp', unlockHint: 'Grow portfolio to 10% of your FIRE corpus',   category: 'portfolio'    },
  { id: 'corpus-50pct',        name: 'Halfway!',             description: 'Portfolio at 50% of FIRE target',       icon: 'BarChart2',  unlockHint: 'Grow portfolio to 50% of your FIRE corpus',   category: 'portfolio'    },
  { id: 'corpus-100pct',       name: 'FIRE Achieved!',       description: 'Portfolio hit your full FIRE target',   icon: 'Award',      unlockHint: 'Reach 100% of your FIRE corpus',              category: 'portfolio'    },
  { id: 'week-warrior',        name: 'Week Warrior',         description: 'Visited 7 days in a row',               icon: 'Zap',        unlockHint: 'Open the app 7 consecutive days',             category: 'consistency'  },
  { id: 'monthly-discipline',  name: 'Monthly Discipline',   description: 'Visited 30 days in a row',              icon: 'Star',       unlockHint: 'Open the app 30 consecutive days',            category: 'consistency'  },
]

const NUDGE_MESSAGES: Record<string, string> = {
  'no-health-profile': 'Run your first health check to see your score',
  'high-dti':          'Your debt load is high — consider prepaying before increasing SIPs',
  'stale-holdings':    'Your portfolio values may be stale — update for accurate projections',
}

export function getNudgeMessage(id: string): string {
  return NUDGE_MESSAGES[id] ?? ''
}

const DEFAULT_DATA: GamificationData = {
  badges: BADGE_DEFS.map((d) => ({
    id: d.id, name: d.name, description: d.description,
    icon: d.icon, earned: false, category: d.category,
  })),
  streakDays: 0,
  lastVisitDate: '',
  dismissedNudges: [],
}

function mergeBadges(stored: Badge[]): Badge[] {
  const map = new Map(stored.map((b) => [b.id, b]))
  return BADGE_DEFS.map((def) => {
    const s = map.get(def.id)
    return {
      id: def.id, name: def.name, description: def.description,
      icon: def.icon, category: def.category,
      earned: s?.earned ?? false,
      earnedDate: s?.earnedDate,
    }
  })
}

export function useGamification() {
  return useQuery({
    queryKey: GAMIFICATION_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ data: GamificationData | null }>('/gamification')
      if (!data.data) return DEFAULT_DATA
      return { ...data.data, badges: mergeBadges(data.data.badges) }
    },
  })
}

export function useUpdateGamification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (patch: GamificationPatch) => {
      const { data } = await api.patch<{ data: GamificationData }>('/gamification', patch)
      return { ...data.data, badges: mergeBadges(data.data.badges) }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(GAMIFICATION_QUERY_KEY, updated)
    },
  })
}

function checkBadges(
  badges: Badge[],
  holdings: Holding[],
  fireProfile: ExtendedFireInputs | null,
  healthProfile: HealthInputs | null,
  goals: Goal[],
  streakDays: number,
  currentPortfolio: number,
): Badge[] {
  const today = new Date().toISOString().slice(0, 10)
  const effectiveCorpus =
    fireProfile?.base
      ? computeFireResult(fireProfile.base, currentPortfolio).effectiveCorpus
      : 0

  const met: Record<string, boolean> = {
    'first-holding':       holdings.length >= 1,
    'triple-threat':       holdings.some((h) => h.assetClass === 'MF') &&
                           holdings.some((h) => h.assetClass === 'NPS') &&
                           holdings.some((h) => h.assetClass === 'EPF'),
    'fire-starter':        fireProfile !== null,
    'health-check':        healthProfile !== null,
    'goal-setter':         goals.length >= 3,
    'corpus-10pct':        effectiveCorpus > 0 && currentPortfolio >= effectiveCorpus * 0.1,
    'corpus-50pct':        effectiveCorpus > 0 && currentPortfolio >= effectiveCorpus * 0.5,
    'corpus-100pct':       effectiveCorpus > 0 && currentPortfolio >= effectiveCorpus,
    'week-warrior':        streakDays >= 7,
    'monthly-discipline':  streakDays >= 30,
  }

  return badges.map((b) => {
    if (b.earned) return b
    if (met[b.id]) return { ...b, earned: true, earnedDate: today }
    return b
  })
}

function computeNudge(
  healthProfile: HealthInputs | null,
  holdings: Holding[],
  dismissed: string[],
): string | null {
  const ds = new Set(dismissed)
  const staleMs = 30 * 24 * 60 * 60 * 1000

  if (!ds.has('no-health-profile') && healthProfile === null) return 'no-health-profile'
  if (
    !ds.has('high-dti') &&
    healthProfile !== null &&
    healthProfile.monthlyIncome > 0 &&
    healthProfile.monthlyEMIs / healthProfile.monthlyIncome > 0.4
  ) return 'high-dti'
  if (
    !ds.has('stale-holdings') &&
    holdings.some((h) => Date.now() - new Date(h.lastUpdated).getTime() > staleMs)
  ) return 'stale-holdings'

  return null
}

export function useBootstrapGamification() {
  const { data: gamData, isSuccess: gamOk } = useGamification()
  const { data: holdings, isSuccess: holdingsOk } = useHoldings()
  const { data: fireProfile, isSuccess: fireOk } = useFireProfile()
  const { data: healthProfile, isSuccess: healthOk } = useHealthProfile()
  const { data: goals, isSuccess: goalsOk } = useGoals()
  const { mutate: update } = useUpdateGamification()
  const { setActiveNudge } = useGamificationUIStore()
  const hasRun = useRef(false)

  useEffect(() => {
    if (!gamOk || !holdingsOk || !fireOk || !healthOk || !goalsOk) return
    if (!gamData) return
    if (hasRun.current) return
    hasRun.current = true

    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
    let newStreakDays = gamData.streakDays
    let newLastVisit = gamData.lastVisitDate
    let streakChanged = false

    if (newLastVisit !== today) {
      newStreakDays = newLastVisit === yesterday ? newStreakDays + 1 : 1
      newLastVisit = today
      streakChanged = true
    }

    const currentPortfolio = holdings?.reduce((s, h) => s + h.currentValue, 0) ?? 0
    const newBadges = checkBadges(
      gamData.badges,
      holdings ?? [],
      fireProfile ?? null,
      healthProfile ?? null,
      goals ?? [],
      newStreakDays,
      currentPortfolio,
    )
    const badgesChanged = newBadges.some((b, i) => b.earned !== gamData.badges[i]?.earned)

    if (streakChanged || badgesChanged) {
      const patch: GamificationPatch = {}
      if (streakChanged) { patch.streakDays = newStreakDays; patch.lastVisitDate = newLastVisit }
      if (badgesChanged) patch.badges = newBadges
      update(patch)
    }

    const nudgeId = computeNudge(healthProfile ?? null, holdings ?? [], gamData.dismissedNudges)
    if (nudgeId) setActiveNudge(nudgeId)
  }, [gamOk, holdingsOk, fireOk, healthOk, goalsOk, gamData, holdings, fireProfile, healthProfile, goals, update, setActiveNudge])
}
