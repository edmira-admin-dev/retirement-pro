export interface SnapshotRow {
  metric: string
  value: string
}

export interface ParsedExecutiveSummary {
  summary: string
  snapshot: SnapshotRow[]
}

export function parseExecutiveSummary (content: string): ParsedExecutiveSummary {
  const snapshotIdx = content.search(/\*\*Snapshot\*\*/i)
  if (snapshotIdx === -1) return { summary: content.trim(), snapshot: [] }

  const summary = content.slice(0, snapshotIdx).trim()
  const tablePart = content.slice(snapshotIdx)

  const rows: SnapshotRow[] = []
  const lineRe = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/gm
  let m: RegExpExecArray | null
  while ((m = lineRe.exec(tablePart))) {
    const metric = m[1].trim()
    const value = m[2].trim()
    if (/^-+$/.test(metric) || metric.toLowerCase() === 'metric') continue
    rows.push({ metric, value })
  }

  return { summary, snapshot: rows }
}
