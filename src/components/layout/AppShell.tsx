import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { StreakCounter } from '../gamification/StreakCounter'
import { NudgeBanner } from '../gamification/NudgeBanner'
import { useBootstrapGamification } from '../../hooks/useGamification'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/portfolio': 'Portfolio',
  '/calculator': 'FIRE Calculator',
  '/health': 'Health Score',
  '/goals': 'Goals',
}

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'Retirement Pro'
  useBootstrapGamification()

  return (
    <div className="flex h-screen bg-theme-bg overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-16 lg:w-60 shrink-0 flex-col">
        <Sidebar collapsed={false} />
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 md:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="relative h-full">
          <button
            className="absolute top-3 right-3 p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-bg-alt transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
          <Sidebar collapsed={false} onClose={() => setDrawerOpen(false)} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopBar
          title={title}
          action={<StreakCounter />}
          onMenuClick={() => setDrawerOpen(true)}
        />
        <NudgeBanner />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
