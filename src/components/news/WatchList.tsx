import type { WatchEvent } from '../../types/news'

export function WatchList({ events }: { events: WatchEvent[] }) {
  return (
    <div className="bg-theme-card border border-theme-border rounded-xl shadow-sm p-4 space-y-3">
      <h2 className="text-sm font-bold text-theme-text">Watch This Week</h2>
      {events.length === 0 && (
        <p className="text-xs text-theme-muted">No upcoming results or corporate actions for your holdings right now.</p>
      )}
      {events.map((e, idx) => (
        <div key={`${e.symbol}-${e.date}-${idx}`} className="flex items-start gap-2.5">
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
              e.type === 'RESULTS' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'
            }`}
          >
            {e.date}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-theme-text truncate">{e.symbol}</p>
            <p className="text-[11px] text-theme-text-sec leading-snug">{e.detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
