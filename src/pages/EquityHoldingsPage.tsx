import { useState } from 'react'
import { BarChart2, PiggyBank, Upload } from 'lucide-react'
import { useEquityHoldings } from '../hooks/useEquityHoldings'
import { useMutualFundHoldings } from '../hooks/useMutualFundHoldings'
import { EquityHoldingsTable, type WeightBasis } from '../components/holdings/EquityHoldingsTable'
import { EtfHoldingsTable } from '../components/holdings/EtfHoldingsTable'
import { MutualFundHoldingsTable } from '../components/holdings/MutualFundHoldingsTable'
import { EquityHoldingsSummary } from '../components/holdings/EquityHoldingsSummary'
import { UploadHoldingsModal } from '../components/holdings/UploadHoldingsModal'
import { UploadMutualFundHoldingsModal } from '../components/holdings/UploadMutualFundHoldingsModal'
import { BenchmarkReturnsTable } from '../components/holdings/BenchmarkReturnsTable'

export default function EquityHoldingsPage () {
  const [showUpload, setShowUpload] = useState(false)
  const [showMfUpload, setShowMfUpload] = useState(false)
  const [weightBasis, setWeightBasis] = useState<WeightBasis>('current')

  const holdingsQuery = useEquityHoldings()
  const mfHoldingsQuery = useMutualFundHoldings()

  const activeDate = holdingsQuery.data?.[0]?.asOfDate

  // ETFs are pulled out into their own table with their own weight-within-ETFs
  // figure; direct stocks get their weight redistributed to 100% among
  // themselves so the benchmark sector comparison isn't diluted by ETF value.
  // Both tables' heading also shows what share of the whole portfolio they are.
  const basisValue = (h: { currentValue: number; investedValue: number }) =>
    weightBasis === 'current' ? h.currentValue : h.investedValue

  const allHoldings = holdingsQuery.data ?? []
  const etfHoldingsRaw = allHoldings.filter(h => h.sector === 'ETF')
  const rawStockHoldings = allHoldings.filter(h => h.sector !== 'ETF')

  const mfHoldingsRaw = mfHoldingsQuery.data ?? []
  const mfBasisValue = (h: { currentValue: number; investedValue: number }) =>
    weightBasis === 'current' ? h.currentValue : h.investedValue

  const stockTotal = rawStockHoldings.reduce((s, h) => s + basisValue(h), 0)
  const etfTotal = etfHoldingsRaw.reduce((s, h) => s + basisValue(h), 0)
  const mfTotal = mfHoldingsRaw.reduce((s, h) => s + mfBasisValue(h), 0)
  const portfolioTotal = stockTotal + etfTotal + mfTotal
  const mfInvested = mfHoldingsRaw.reduce((s, h) => s + h.investedValue, 0)
  const mfCurrent = mfHoldingsRaw.reduce((s, h) => s + h.currentValue, 0)

  const stockHoldings = rawStockHoldings.map(h => ({
    ...h,
    portfolioWeightPct: stockTotal > 0 ? (basisValue(h) / stockTotal) * 100 : 0,
  }))
  const etfHoldings = etfHoldingsRaw.map(h => ({
    ...h,
    portfolioWeightPct: etfTotal > 0 ? (basisValue(h) / etfTotal) * 100 : 0,
  }))
  const mfHoldings = mfHoldingsRaw.map(h => ({
    ...h,
    weightPct: mfTotal > 0 ? (mfBasisValue(h) / mfTotal) * 100 : 0,
  }))

  const stockPortfolioPct = portfolioTotal > 0 ? (stockTotal / portfolioTotal) * 100 : 0
  const etfPortfolioPct = portfolioTotal > 0 ? (etfTotal / portfolioTotal) * 100 : 0
  const mfPortfolioPct = portfolioTotal > 0 ? (mfTotal / portfolioTotal) * 100 : 0

  const handleSaved = () => {
    setShowUpload(false)
  }

  const handleMfSaved = () => {
    setShowMfUpload(false)
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <BarChart2 size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-theme-text">Equity Holdings</h1>
            <p className="text-xs text-theme-muted">Snapshot all your brokers at once — sector &amp; industry are auto-tagged</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMfUpload(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-theme-border hover:bg-theme-bg-alt text-theme-text text-sm font-medium transition-colors cursor-pointer"
          >
            <PiggyBank size={14} />
            Upload MF Holdings CSV
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <Upload size={14} />
            Upload Holdings CSV
          </button>
        </div>
      </div>

      {showUpload && (
        <UploadHoldingsModal onClose={() => setShowUpload(false)} onSaved={handleSaved} />
      )}

      {showMfUpload && (
        <UploadMutualFundHoldingsModal onClose={() => setShowMfUpload(false)} onSaved={handleMfSaved} />
      )}

      {(holdingsQuery.data?.length ?? 0) > 0 && (
        <EquityHoldingsSummary
          holdings={holdingsQuery.data!}
          asOfDate={activeDate}
          onRefresh={() => holdingsQuery.refetch()}
          isRefreshing={holdingsQuery.isFetching}
          mfInvested={mfInvested}
          mfCurrent={mfCurrent}
        />
      )}

      {holdingsQuery.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          <BenchmarkReturnsTable holdings={stockHoldings} />
          <EquityHoldingsTable
            holdings={stockHoldings}
            portfolioPct={stockPortfolioPct}
            weightBasis={weightBasis}
            onWeightBasisChange={setWeightBasis}
          />
          <EtfHoldingsTable holdings={etfHoldings} portfolioPct={etfPortfolioPct} />
          <MutualFundHoldingsTable holdings={mfHoldings} portfolioPct={mfPortfolioPct} />
        </>
      )}
    </div>
  )
}
