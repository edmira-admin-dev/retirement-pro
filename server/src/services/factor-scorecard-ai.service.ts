import { prisma } from '../config/prisma'
import { AppError } from '../middleware/errorHandler'
import { PROVIDERS, callProvider, type AiFactorScore, type FundamentalInput, type Provider } from './ai-providers'
import { REASONING_KEYS, recommendationForScore, type FactorReasoning } from './factor-scorecard.service'
import { getFundamentalRows } from './factor-scorecard-fundamentals.service'

const BATCH_SIZE = 8
const FACTOR_KEYS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10'] as const

export interface RunSummary {
  id: string
  status: string
  batchesTotal: number
  batchesDone: number
  resultUploadId: string | null
  error: string | null
  universe: string
  runDate: string
  createdAt: string
  updatedAt: string
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

interface Collated {
  ticker: string
  avg: Record<(typeof FACTOR_KEYS)[number], number>
  score: number
  reasoning: FactorReasoning
  perProvider: Partial<Record<Provider, AiFactorScore>>
}

function collate(ticker: string, perProvider: Partial<Record<Provider, AiFactorScore>>): Collated {
  const avg = {} as Record<(typeof FACTOR_KEYS)[number], number>
  for (const key of FACTOR_KEYS) {
    const vals = PROVIDERS.map((p) => perProvider[p]?.[key]).filter((v): v is number => typeof v === 'number')
    avg[key] = vals.length ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10 : 0
  }
  const score = Math.round((FACTOR_KEYS.reduce((s, k) => s + avg[k], 0) / FACTOR_KEYS.length) * 100) / 10

  const reasoning = {} as FactorReasoning
  for (const key of REASONING_KEYS) {
    const factorKey = FACTOR_KEYS[REASONING_KEYS.indexOf(key)]
    let best: Provider | null = null
    let bestDiff = Infinity
    for (const p of PROVIDERS) {
      const entry = perProvider[p]
      if (!entry) continue
      const diff = Math.abs(entry[factorKey] - avg[factorKey])
      if (diff < bestDiff) { bestDiff = diff; best = p }
    }
    reasoning[key] = best ? perProvider[best]!.reasoning[key] : ''
  }

  return { ticker, avg, score, reasoning, perProvider }
}

async function scoreBatch(batch: FundamentalInput[]): Promise<Collated[]> {
  const results = await Promise.allSettled(PROVIDERS.map((p) => callProvider(p, batch)))

  const byTickerByProvider = new Map<string, Partial<Record<Provider, AiFactorScore>>>()
  batch.forEach((r) => byTickerByProvider.set(r.ticker, {}))

  results.forEach((res, i) => {
    const provider = PROVIDERS[i]
    if (res.status === 'rejected') {
      console.error(`[factor-scorecard-ai] ${provider} batch failed:`, res.reason)
      return
    }
    for (const score of res.value) {
      const entry = byTickerByProvider.get(score.ticker)
      if (entry) entry[provider] = score
    }
  })

  return batch
    .filter((r) => Object.keys(byTickerByProvider.get(r.ticker) ?? {}).length > 0)
    .map((r) => collate(r.ticker, byTickerByProvider.get(r.ticker)!))
}

async function runJob(runId: string, userId: string, fundamentalsUploadId: string) {
  try {
    const { universe, runDate, rows } = await getFundamentalRows(userId, fundamentalsUploadId)
    const batches = chunk(rows, BATCH_SIZE)

    await prisma.factorScorecardRun.update({
      where: { id: runId },
      data: { status: 'RUNNING', batchesTotal: batches.length },
    })

    const collated: Collated[] = []
    for (const batch of batches) {
      const results = await scoreBatch(batch)
      collated.push(...results)
      await prisma.factorScorecardRun.update({
        where: { id: runId },
        data: { batchesDone: { increment: 1 } },
      })
    }

    if (!collated.length) throw new Error('No stocks were successfully scored by any provider')

    const cmpByTicker = new Map(rows.map((r) => [r.ticker, r.cmp]))
    const sectorByTicker = new Map(rows.map((r) => [r.ticker, r.sector]))
    const ranked = [...collated].sort((a, b) => b.score - a.score)

    const upload = await prisma.$transaction(async (tx) => {
      await tx.factorScorecardUpload.deleteMany({ where: { userId, universe, runDate } })
      const created = await tx.factorScorecardUpload.create({
        data: { userId, fileName: `AI Scorecard — ${universe} ${runDate}`, universe, runDate, source: 'AI_GENERATED' },
      })

      for (let i = 0; i < ranked.length; i++) {
        const c = ranked[i]
        const entry = await tx.factorScorecardEntry.create({
          data: {
            userId, uploadId: created.id, universe, runDate, rank: i + 1,
            ticker: c.ticker, sector: sectorByTicker.get(c.ticker) ?? '', cmp: cmpByTicker.get(c.ticker) ?? 0,
            f1: c.avg.f1, f2: c.avg.f2, f3: c.avg.f3, f4: c.avg.f4, f5: c.avg.f5,
            f6: c.avg.f6, f7: c.avg.f7, f8: c.avg.f8, f9: c.avg.f9, f10: c.avg.f10,
            score: c.score,
            recommendation: recommendationForScore(c.score),
            reasoning: { ...c.reasoning },
          },
        })

        for (const provider of PROVIDERS) {
          const p = c.perProvider[provider]
          if (!p) continue
          const providerScore = Math.round((FACTOR_KEYS.reduce((s, k) => s + p[k], 0) / FACTOR_KEYS.length) * 100) / 10
          await tx.factorScorecardModelScore.create({
            data: {
              userId, entryId: entry.id, provider,
              f1: p.f1, f2: p.f2, f3: p.f3, f4: p.f4, f5: p.f5, f6: p.f6, f7: p.f7, f8: p.f8, f9: p.f9, f10: p.f10,
              score: providerScore,
              reasoning: { ...p.reasoning },
            },
          })
        }
      }

      return created
    }, { timeout: 60_000 })

    await prisma.factorScorecardRun.update({
      where: { id: runId },
      data: { status: 'DONE', resultUploadId: upload.id },
    })
  } catch (err) {
    console.error('[factor-scorecard-ai] run failed:', err)
    await prisma.factorScorecardRun.update({
      where: { id: runId },
      data: { status: 'FAILED', error: err instanceof Error ? err.message : String(err) },
    }).catch(() => {})
  }
}

export async function startRun(userId: string, fundamentalsUploadId: string): Promise<RunSummary> {
  const fundamentalsUpload = await prisma.factorScorecardFundamentalsUpload.findFirst({
    where: { id: fundamentalsUploadId, userId },
  })
  if (!fundamentalsUpload) throw new AppError(404, 'Fundamentals upload not found')

  const run = await prisma.factorScorecardRun.create({
    data: {
      userId, fundamentalsUploadId, universe: fundamentalsUpload.universe, runDate: fundamentalsUpload.runDate,
      status: 'PENDING',
    },
  })

  void runJob(run.id, userId, fundamentalsUploadId)

  return toSummary(run)
}

function toSummary(run: { id: string; status: string; batchesTotal: number; batchesDone: number; resultUploadId: string | null; error: string | null; universe: string; runDate: string; createdAt: Date; updatedAt: Date }): RunSummary {
  return {
    id: run.id, status: run.status, batchesTotal: run.batchesTotal, batchesDone: run.batchesDone,
    resultUploadId: run.resultUploadId, error: run.error, universe: run.universe, runDate: run.runDate,
    createdAt: run.createdAt.toISOString(), updatedAt: run.updatedAt.toISOString(),
  }
}

export async function getRun(userId: string, runId: string): Promise<RunSummary> {
  const run = await prisma.factorScorecardRun.findFirst({ where: { id: runId, userId } })
  if (!run) throw new AppError(404, 'Run not found')
  return toSummary(run)
}

export async function listRuns(userId: string): Promise<RunSummary[]> {
  const runs = await prisma.factorScorecardRun.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 })
  return runs.map(toSummary)
}
