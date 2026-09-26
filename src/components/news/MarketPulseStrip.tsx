import type { MarketPulse, PulseTile } from '../../types/news'

function ChangeBadge({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-[11px] text-theme-muted">—</span>
  const positive = pct >= 0
  return (
    <span className={`text-[11px] font-semibold ${positive ? 'text-green-600' : 'text-red-500'}`}>
      {positive ? '+' : ''}{pct.toFixed(2)}%
    </span>
  )
}

function Tile({ tile }: { tile: PulseTile }) {
  return (
    <div className="flex flex-col gap-0.5 px-3.5 py-2.5 min-w-[110px] shrink-0">
      <span className="text-[11px] text-theme-muted uppercase tracking-wide">{tile.label}</span>
      <span className="text-sm font-bold text-theme-text">{tile.value}</span>
      <ChangeBadge pct={tile.changePct} />
    </div>
  )
}

export function MarketPulseStrip({ pulse }: { pulse: MarketPulse }) {
  const tiles = [...pulse.indices, ...pulse.global, ...pulse.currency, ...pulse.commodity, ...pulse.yields]

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl shadow-sm overflow-x-auto">
      <div className="flex divide-x divide-theme-border min-w-max">
        {tiles.map((t) => (
          <Tile key={t.label} tile={t} />
        ))}
        {pulse.fiiDii && (
          <>
            <div className="flex flex-col gap-0.5 px-3.5 py-2.5 min-w-[110px] shrink-0">
              <span className="text-[11px] text-theme-muted uppercase tracking-wide">FII Net</span>
              <span className={`text-sm font-bold ${pulse.fiiDii.fiiNetCr >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                ₹{pulse.fiiDii.fiiNetCr.toLocaleString('en-IN')} Cr
              </span>
            </div>
            <div className="flex flex-col gap-0.5 px-3.5 py-2.5 min-w-[110px] shrink-0">
              <span className="text-[11px] text-theme-muted uppercase tracking-wide">DII Net</span>
              <span className={`text-sm font-bold ${pulse.fiiDii.diiNetCr >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                ₹{pulse.fiiDii.diiNetCr.toLocaleString('en-IN')} Cr
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
