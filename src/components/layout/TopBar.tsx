import { Menu } from 'lucide-react'

interface TopBarProps {
  title: string
  action?: React.ReactNode
  onMenuClick: () => void
}

export function TopBar({ title, action, onMenuClick }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-surface-card md:bg-transparent md:border-none md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-text-muted hover:bg-surface-card hover:text-text-primary transition-colors cursor-pointer md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </header>
  )
}
