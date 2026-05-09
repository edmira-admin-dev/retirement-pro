import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-theme-primary mb-4">404</p>
        <h1 className="text-xl font-semibold text-theme-text mb-2">Page not found</h1>
        <p className="text-theme-muted text-sm mb-6">The page you're looking for doesn't exist.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
        >
          <Home size={16} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
