import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useBootstrap } from './hooks/useBootstrap'
import { queryClient } from './lib/queryClient'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'))
const HealthPage = lazy(() => import('./pages/HealthPage'))
const GoalsPage = lazy(() => import('./pages/GoalsPage'))
const IncomePage = lazy(() => import('./pages/IncomePage'))
const ExpensePage = lazy(() => import('./pages/ExpensePage'))
const TradingJournalPage = lazy(() => import('./pages/TradingJournalPage'))
const TradeBookPage = lazy(() => import('./pages/TradeBookPage'))
const TaxPnlPage = lazy(() => import('./pages/TaxPnlPage'))
const TradeSignalPage = lazy(() => import('./pages/TradeSignalPage'))
const VCPSignalPage = lazy(() => import('./pages/VCPSignalPage'))
const EquityHoldingsPage = lazy(() => import('./pages/EquityHoldingsPage'))
const NewsFeedPage = lazy(() => import('./pages/NewsFeedPage'))
const StockResearchPage = lazy(() => import('./pages/StockResearchPage'))
const FactorScorecardPage = lazy(() => import('./pages/FactorScorecardPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

function AppRoutes() {
  const ready = useBootstrap()

  if (!ready) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-theme-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-theme-bg flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-theme-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/expenses" element={<ExpensePage />} />
          <Route path="/trading" element={<TradingJournalPage />} />
          <Route path="/tradebook" element={<TradeBookPage />} />
          <Route path="/taxpnl" element={<TaxPnlPage />} />
          <Route path="/signals" element={<TradeSignalPage />} />
          <Route path="/vcp-signals" element={<VCPSignalPage />} />
          <Route path="/factor-scorecard" element={<FactorScorecardPage />} />
          <Route path="/holdings/equity" element={<EquityHoldingsPage />} />
          <Route path="/news" element={<NewsFeedPage />} />
          <Route path="/stock" element={<StockResearchPage />} />
          <Route path="/stock/:ticker" element={<StockResearchPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
