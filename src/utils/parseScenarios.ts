export interface ScenarioRow {
  scenario: string
  target?: string
  changePct?: string
  commentary: string
}

export interface ParsedScenarios {
  rows: ScenarioRow[]
}

export function parseScenarios (content: string): ParsedScenarios | null {
  const rowRe = /\*\*([A-Za-z]+)\s+case\s*\(target\s*₹?([\d,]+),\s*([+-]?\d+%)\)\s*:?\*\*\s*([\s\S]*?)(?=\*\*[A-Za-z]+\s+case\s*\(target|$)/g

  const rows: ScenarioRow[] = []
  let m: RegExpExecArray | null
  while ((m = rowRe.exec(content))) {
    rows.push({
      scenario: m[1].trim(),
      target: m[2].trim(),
      changePct: m[3].trim(),
      commentary: m[4].trim().replace(/\s+/g, ' '),
    })
  }

  if (rows.length === 0) return null
  return { rows }
}
