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
  { to: '/dashboard', label: 'Dashboard',   icon: <LayoutDashboard size={18} /> },
  { to: '/portfolio', label: 'Investments', icon: <Briefcase size={18} /> },
  { to: '/calculator', label: 'FIRE Calc',  icon: <Calculator size={18} /> },
  { to: '/health',    label: 'Health Score', icon: <Heart size={18} /> },
  { to: '/goals',     label: 'Goals',        icon: <Target size={18} /> },
]

interface SidebarProps {
  collapsed: boolean
  onClose?: () => void
}

export function Sidebar({ collapsed, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-sm',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary',
      isActive
        ? 'bg-theme-primary text-white font-semibold shadow-sm'
        : 'text-theme-text-sec hover:bg-theme-bg-alt hover:text-theme-text font-medium',
    ].join(' ')

  return (
    <aside className="flex h-full flex-col bg-theme-card border-r border-theme-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-theme-border">
        <div className="w-8 h-8 rounded-xl bg-theme-primary flex items-center justify-center shrink-0">
          <TrendingUp size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-theme-text tracking-tight text-sm">
            Desi FIRE
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={linkClass}
            onClick={onClose}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="truncate">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-2.5 py-3 border-t border-theme-border space-y-1">
        {!collapsed && user && (
          <div className="px-3 py-2 rounded-xl bg-theme-bg-alt mb-1">
            <p className="text-xs text-theme-muted truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-theme-muted hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger text-sm font-medium"
          aria-label="Log out"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  )
}
