import type { TeEvent, TeTag } from '../../types/news'

const TAG_STYLE: Record<TeTag, string> = {
  RBI: 'bg-green-50 text-green-700',
  FED: 'bg-amber-50 text-amber-700',
  MAJOR: 'bg-theme-bg-alt text-theme-text-sec',
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diffMs / 3_600_000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function MacroPanel({ items }: { items: TeEvent[] }) {
  return (
    <div className="bg-theme-card border border-theme-border rounded-xl shadow-sm p-4 space-y-3">
      <h2 className="text-sm font-bold text-theme-text">Macro &amp; Policy</h2>
      <p className="text-[11px] text-theme-muted -mt-2">Major events, Fed &amp; RBI — via Trading Economics</p>
      {items.length === 0 && <p className="text-xs text-theme-muted">Nothing high-signal right now.</p>}
      {items.map((item) => (
        <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="block group">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase ${TAG_STYLE[item.tag]}`}>
              {item.tag}
            </span>
            <span className="text-[10px] text-theme-muted">{timeAgo(item.date)}</span>
          </div>
          <p className="text-xs font-medium text-theme-text leading-snug group-hover:text-indigo-600">{item.title}</p>
        </a>
      ))}
    </div>
  )
}
