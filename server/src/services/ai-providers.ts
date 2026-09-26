import type { FactorReasoning } from './factor-scorecard.service'

export type Provider = 'OPENAI' | 'GEMINI' | 'CLAUDE'

export const PROVIDERS: Provider[] = ['OPENAI', 'GEMINI', 'CLAUDE']

export interface FundamentalInput {
  ticker: string
  sector: string
  cmp: number
  pe?: number | null
  pb?: number | null
  roe?: number | null
  roce?: number | null
  debtToEquity?: number | null
  revenueCagr3yr?: number | null
  profitCagr3yr?: number | null
  dividendYieldPct?: number | null
  payoutPct?: number | null
  promoterHoldingPct?: number | null
  fiiDiiHoldingPct?: number | null
  beta?: number | null
  notes?: string | null
}

export interface AiFactorScore {
  ticker: string
  f1: number; f2: number; f3: number; f4: number; f5: number
  f6: number; f7: number; f8: number; f9: number; f10: number
  reasoning: FactorReasoning
}

const FACTOR_RUBRIC = `Score each stock on 10 factors, each an integer 0-10 (10 = best):
F1 Moat: durability of competitive advantage / pricing power
F2 Financial: ROE, ROCE, debt strength
F3 Growth: revenue and profit growth quality (3yr CAGR)
F4 Valuation: attractiveness of P/E and P/B vs sector peers (cheaper relative to quality = higher score)
F5 Mgmt: management quality and governance track record
F6 Earnings: earnings visibility and consistency
F7 Macro: sector macro tailwind / cycle positioning
F8 Risk: balance-sheet and business risk (lower risk = higher score)
F9 Dividend: dividend yield and payout attractiveness
F10 Liquidity: trading liquidity and institutional (FII/DII) interest`

function buildPrompt(batch: FundamentalInput[]): string {
  const rows = batch.map((r) => JSON.stringify({
    ticker: r.ticker, sector: r.sector, cmp: r.cmp, pe: r.pe ?? null, pb: r.pb ?? null,
    roe: r.roe ?? null, roce: r.roce ?? null, debtToEquity: r.debtToEquity ?? null,
    revenueCagr3yr: r.revenueCagr3yr ?? null, profitCagr3yr: r.profitCagr3yr ?? null,
    dividendYieldPct: r.dividendYieldPct ?? null, payoutPct: r.payoutPct ?? null,
    promoterHoldingPct: r.promoterHoldingPct ?? null, fiiDiiHoldingPct: r.fiiDiiHoldingPct ?? null,
    beta: r.beta ?? null, notes: r.notes ?? '',
  })).join('\n')

  return `You are a fundamental equity analyst scoring Indian (NSE) stocks for a factor-based scorecard.

${FACTOR_RUBRIC}

Stock data (one JSON object per line):
${rows}

Respond with ONLY a JSON array (no markdown, no commentary), one object per stock in the SAME ORDER, each shaped exactly as:
{"ticker": "...", "f1": 0-10, "f2": 0-10, "f3": 0-10, "f4": 0-10, "f5": 0-10, "f6": 0-10, "f7": 0-10, "f8": 0-10, "f9": 0-10, "f10": 0-10, "reasoning": {"moat": "one short sentence", "financial": "...", "growth": "...", "valuation": "...", "mgmt": "...", "earnings": "...", "macro": "...", "risk": "...", "dividend": "...", "liquidity": "..."}}`
}

function extractJsonArray(text: string): unknown[] {
  const cleaned = text.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim()
  const start = cleaned.indexOf('[')
  const end = cleaned.lastIndexOf(']')
  if (start === -1 || end === -1) throw new Error('No JSON array found in AI response')
  return JSON.parse(cleaned.slice(start, end + 1))
}

function clamp10(n: unknown): number {
  const v = Number(n)
  if (Number.isNaN(v)) return 0
  return Math.max(0, Math.min(10, v))
}

function toReasoning(r: unknown): FactorReasoning {
  const o = (r ?? {}) as Record<string, unknown>
  const keys: (keyof FactorReasoning)[] = ['moat', 'financial', 'growth', 'valuation', 'mgmt', 'earnings', 'macro', 'risk', 'dividend', 'liquidity']
  return keys.reduce((acc, k) => ({ ...acc, [k]: String(o[k] ?? '') }), {} as FactorReasoning)
}

function normalize(raw: unknown[]): AiFactorScore[] {
  return raw.map((item) => {
    const o = item as Record<string, unknown>
    return {
      ticker: String(o.ticker ?? ''),
      f1: clamp10(o.f1), f2: clamp10(o.f2), f3: clamp10(o.f3), f4: clamp10(o.f4), f5: clamp10(o.f5),
      f6: clamp10(o.f6), f7: clamp10(o.f7), f8: clamp10(o.f8), f9: clamp10(o.f9), f10: clamp10(o.f10),
      reasoning: toReasoning(o.reasoning),
    }
  })
}

// ── OpenAI ────────────────────────────────────────────────────────────────────

async function callOpenAI(batch: FundamentalInput[]): Promise<AiFactorScore[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured')
  const model = process.env.OPENAI_MODEL || 'gpt-4o'

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: buildPrompt(batch) }],
      temperature: 0.2,
    }),
  })
  if (!res.ok) throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`)
  const data = await res.json() as { choices: { message: { content: string } }[] }
  return normalize(extractJsonArray(data.choices[0].message.content))
}

// ── Gemini ────────────────────────────────────────────────────────────────────

async function callGemini(batch: FundamentalInput[]): Promise<AiFactorScore[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(batch) }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    },
  )
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`)
  const data = await res.json() as { candidates: { content: { parts: { text: string }[] } }[] }
  return normalize(extractJsonArray(data.candidates[0].content.parts[0].text))
}

// ── Claude ────────────────────────────────────────────────────────────────────

async function callClaude(batch: FundamentalInput[]): Promise<AiFactorScore[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')
  const model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022'

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: 0.2,
      messages: [{ role: 'user', content: buildPrompt(batch) }],
    }),
  })
  if (!res.ok) throw new Error(`Claude API error ${res.status}: ${await res.text()}`)
  const data = await res.json() as { content: { type: string; text: string }[] }
  const text = data.content.find((c) => c.type === 'text')?.text ?? ''
  return normalize(extractJsonArray(text))
}

const PROVIDER_FN: Record<Provider, (batch: FundamentalInput[]) => Promise<AiFactorScore[]>> = {
  OPENAI: callOpenAI,
  GEMINI: callGemini,
  CLAUDE: callClaude,
}

export async function callProvider(provider: Provider, batch: FundamentalInput[]): Promise<AiFactorScore[]> {
  return PROVIDER_FN[provider](batch)
}
