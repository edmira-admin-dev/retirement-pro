export interface ScorecardRow {
  factor: string
  weightPct?: number
  score?: number
  commentary: string
}

export interface ParsedScorecard {
  rows: ScorecardRow[]
  totalLine?: string
}

export function parseScorecard (content: string): ParsedScorecard | null {
  const weights = new Map<string, number>()
  const weightsRe = /((?:[A-Z][a-zA-Z]*(?:\/[A-Z][a-zA-Z]*)?)(?:\s[A-Z][a-zA-Z]*)*)\s*\((\d+)%\)/g
  let wm: RegExpExecArray | null
  while ((wm = weightsRe.exec(content))) {
    weights.set(wm[1].trim().toLowerCase(), Number(wm[2]))
  }

  const rowRe = /\*\*([A-Za-z][A-Za-z\s/]*?)\s*\(score\s*(\d+)\/100\)\s*:?\*\*\s*([\s\S]*?)(?=\*\*[A-Za-z][A-Za-z\s/]*?\s*\(score\s*\d+\/100\)|\n>|$)/g

  const rows: ScorecardRow[] = []
  let m: RegExpExecArray | null
  while ((m = rowRe.exec(content))) {
    const factor = m[1].trim()
    rows.push({
      factor,
      weightPct: weights.get(factor.toLowerCase()),
      score: Number(m[2]),
      commentary: m[3].trim().replace(/\s+/g, ' '),
    })
  }

  if (rows.length === 0) return null

  const totalMatch = content.match(/>\s*\*\*(TOTAL[^*]*)\*\*/i)
  return { rows, totalLine: totalMatch?.[1]?.trim() }
}
