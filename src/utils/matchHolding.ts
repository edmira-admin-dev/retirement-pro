export function normalizeSymbol (s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function findHoldingForTicker<T extends { symbol: string }> (holdings: T[], ticker: string): T | undefined {
  const t = normalizeSymbol(ticker)
  if (!t) return undefined

  const exact = holdings.find(h => normalizeSymbol(h.symbol) === t)
  if (exact) return exact

  if (t.length < 3) return undefined
  return holdings.find(h => {
    const s = normalizeSymbol(h.symbol)
    return s.length >= 3 && (s.startsWith(t) || t.startsWith(s))
  })
}
