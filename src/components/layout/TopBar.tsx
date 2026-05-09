import { Menu } from 'lucide-react'
import { ThemeSwitcher } from '../ui/ThemeSwitcher'

interface TopBarProps {
  title: string
  action?: React.ReactNode
  onMenuClick: () => void
}

export function TopBar({ title, action, onMenuClick }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-theme-border bg-theme-card md:bg-theme-bg md:border-none md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-theme-muted hover:bg-theme-bg-alt hover:text-theme-text transition-colors cursor-pointer md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-bold text-theme-text">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {action && <div>{action}</div>}
        <ThemeSwitcher />
      </div>
    </header>
  )
}
