import { Plus, RefreshCw, Wallet, Sparkles } from 'lucide-react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { PortfolioDashboard } from '../components/portfolio/PortfolioDashboard'
import { AssetEntryForm } from '../components/portfolio/AssetEntryForm'
import { QuickAddModal } from '../components/portfolio/QuickAddModal'
import { PortfolioWizard } from '../components/portfolio/wizard/PortfolioWizard'
import { useHoldings } from '../hooks/useHoldings'
import { usePortfolioUIStore } from '../stores/portfolioUIStore'

function EmptyPortfolioState() {
  const openWizard = usePortfolioUIStore((s) => s.openWizard)
  const openAdd = usePortfolioUIStore((s) => s.openAdd)

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-theme-primary/10 flex items-center justify-center mb-5">
        <Wallet size={36} className="text-theme-primary" />
      </div>
      <h3 className="text-xl font-bold text-theme-text mb-2">Build your investment portfolio</h3>
      <p className="text-sm text-theme-muted max-w-xs mb-8">
        Tell us about your savings, investments and assets across all categories — takes about 3 minutes.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button
          onClick={openWizard}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary shadow-md flex-1"
        >
          <Sparkles size={16} />
          Get started
        </button>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-theme-primary text-theme-primary hover:bg-theme-bg-alt text-sm font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary flex-1"
        >
          <Plus size={16} />
          Add investment
        </button>
      </div>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg text-center">
        {['Bank & Cash', 'Mutual Funds', 'Stocks & ETFs', 'Gold & Property'].map((label) => (
          <div key={label} className="px-3 py-2 rounded-lg bg-theme-bg-alt border border-theme-border">
            <p className="text-xs text-theme-muted">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PortfolioPage() {
  const { data: holdings = [], isLoading, isError, refetch } = useHoldings()
  const openAdd = usePortfolioUIStore((s) => s.openAdd)
  const openWizard = usePortfolioUIStore((s) => s.openWizard)
  const hasHoldings = holdings.length > 0

  return (
    <PageWrapper>
      {hasHoldings && (
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-theme-text">
            Investments
            <span className="text-theme-muted font-normal text-sm ml-2">
              {holdings.length} holding{holdings.length !== 1 ? 's' : ''}
            </span>
          </h2>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={openWizard}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-theme-primary text-theme-primary hover:bg-theme-primary/10 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
            >
              <Sparkles size={14} />
              Get Started Wizard
            </button>
            <button
              onClick={() => openAdd()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
            >
              <Plus size={16} />
              Add investment
            </button>
          </div>
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
          Failed to load holdings.
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 underline underline-offset-2 cursor-pointer hover:opacity-80"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-40 rounded-xl bg-theme-card border border-theme-border animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-theme-card border border-theme-border animate-pulse" />
            ))}
          </div>
        </div>
      ) : hasHoldings ? (
        <PortfolioDashboard holdings={holdings} />
      ) : (
        <EmptyPortfolioState />
      )}

      {/* Mobile FAB — only when holdings exist */}
      {hasHoldings && (
        <button
          onClick={() => openAdd()}
          className="fixed bottom-6 right-6 sm:hidden flex items-center justify-center w-14 h-14 rounded-full bg-theme-primary hover:bg-theme-primary-dark text-white shadow-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label="Add investment"
        >
          <Plus size={22} />
        </button>
      )}

      <AssetEntryForm />
      <QuickAddModal />
      <PortfolioWizard />
    </PageWrapper>
  )
}
