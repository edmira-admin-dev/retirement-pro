import { Newspaper, RefreshCw } from 'lucide-react'
import { useNewsFeed, useRefreshNewsFeed } from '../hooks/useNewsFeed'
import { MarketPulseStrip } from '../components/news/MarketPulseStrip'
import { BookTable } from '../components/news/BookTable'
import { WatchList } from '../components/news/WatchList'
import { MacroPanel } from '../components/news/MacroPanel'

export default function NewsFeedPage() {
  const feedQuery = useNewsFeed()
  const refreshMutation = useRefreshNewsFeed()
  const isLoading = feedQuery.isLoading || refreshMutation.isPending
  const data = feedQuery.data

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <Newspaper size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-theme-text">Morning Brief</h1>
            <p className="text-xs text-theme-muted">
              {data ? `Updated ${new Date(data.fetchedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'Market pulse, your book, and what to watch today'}
            </p>
          </div>
        </div>
        <button
          onClick={() => refreshMutation.mutate()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {feedQuery.isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      )}

      {data && (
        <>
          <MarketPulseStrip pulse={data.marketPulse} />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
            <div className="space-y-2 min-w-0">
              <h2 className="text-sm font-bold text-theme-text">Your Book Today</h2>
              <BookTable rows={data.book} />
            </div>

            <div className="space-y-5">
              <WatchList events={data.watch} />
              <MacroPanel items={data.macro} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
