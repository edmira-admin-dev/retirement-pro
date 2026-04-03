import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Calculator,
  Heart,
  Target,
  LogOut,
  TrendingUp,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/portfolio', label: 'Portfolio', icon: <Briefcase size={20} /> },
  { to: '/calculator', label: 'FIRE Calc', icon: <Calculator size={20} /> },
  { to: '/health', label: 'Health Score', icon: <Heart size={20} /> },
  { to: '/goals', label: 'Goals', icon: <Target size={20} /> },
]

interface SidebarProps {
  collapsed: boolean
  onClose?: () => void
}

export function Sidebar({ collapsed, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
      isActive
        ? 'bg-brand-500/15 text-brand-500'
        : 'text-text-muted hover:bg-surface-card hover:text-text-primary',
    ].join(' ')

  return (
    <aside className="flex h-full flex-col bg-surface-card border-r border-surface-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-surface-border">
        <TrendingUp size={22} className="text-brand-500 shrink-0" />
        {!collapsed && (
          <span className="font-semibold text-text-primary tracking-tight">
            Retirement Pro
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={linkClass}
            onClick={onClose}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="text-sm font-medium truncate">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-2 py-3 border-t border-surface-border space-y-1">
        {!collapsed && user && (
          <div className="px-3 py-2">
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:bg-surface-border hover:text-danger transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          aria-label="Log out"
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Log out</span>}
        </button>
      </div>
    </aside>
  )
}
