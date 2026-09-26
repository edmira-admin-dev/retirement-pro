export interface ResearchSection {
  id: string
  title: string
  content: string
}

export interface ResearchSnapshot {
  recommendation?: string
  baseTarget?: string
  factorScore?: string
  conviction?: string
  timeHorizon?: string
  cmp?: string
  marketCap?: string
  asOfDate?: string
  exchangeLine?: string
}

export interface ParsedResearchDoc {
  companyName: string
  snapshot: ResearchSnapshot
  sections: ResearchSection[]
  raw: string
}

function extractField (line: string, label: string): string | undefined {
  const re = new RegExp(`\\*\\*${label}:?\\*\\*\\s*([^|]+)`, 'i')
  const match = line.match(re)
  return match?.[1]?.trim()
}

export function parseResearchDoc (raw: string): ParsedResearchDoc {
  const lines = raw.split('\n')

  const titleLine = lines.find(l => l.trim().startsWith('# '))
  const companyName = titleLine ? titleLine.replace(/^#\s*/, '').trim() : 'Untitled'

  const exchangeLine = lines.find(l => /NSE|BSE/i.test(l) && l.trim().startsWith('**'))?.trim()
  const recoLine = lines.find(l => /\*\*Recommendation:?\*\*/i.test(l))
  const cmpLine = lines.find(l => /^CMP:/i.test(l.trim()) || /^\*\*?CMP:?\*\*?/i.test(l.trim()))

  const snapshot: ResearchSnapshot = {
    exchangeLine,
    recommendation: recoLine ? extractField(recoLine, 'Recommendation') : undefined,
    baseTarget: recoLine ? extractField(recoLine, 'Base Target') : undefined,
    factorScore: recoLine ? extractField(recoLine, 'Factor Score') : undefined,
    conviction: recoLine ? extractField(recoLine, 'Conviction') : undefined,
    timeHorizon: recoLine ? extractField(recoLine, 'Time Horizon') : undefined,
  }

  if (cmpLine) {
    const cmpMatch = cmpLine.match(/CMP:?\*?\*?\s*₹?([\d,.]+)/i)
    const mcapMatch = cmpLine.match(/Market Cap:?\*?\*?\s*([^|]+)/i)
    const dateMatch = cmpLine.match(/Date:?\*?\*?\s*([^|]+)/i)
    snapshot.cmp = cmpMatch?.[1]?.trim()
    snapshot.marketCap = mcapMatch?.[1]?.trim()
    snapshot.asOfDate = dateMatch?.[1]?.trim()
  }

  const sectionRe = /^##\s+(Section\s+\d+[:\-]?\s*.*)$/gim
  const sections: ResearchSection[] = []
  const matches = [...raw.matchAll(sectionRe)]

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]
    const start = m.index! + m[0].length
    const end = i + 1 < matches.length ? matches[i + 1].index! : raw.length
    const title = m[1].trim()
    sections.push({
      id: title.match(/Section\s+(\d+)/i)?.[1] ?? String(i),
      title,
      content: raw.slice(start, end).trim(),
    })
  }

  return { companyName, snapshot, sections, raw }
}
