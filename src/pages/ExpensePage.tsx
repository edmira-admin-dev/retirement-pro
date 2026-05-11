import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Copy, Check, AlertCircle } from 'lucide-react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { ExpenseStats } from '../components/expense/ExpenseStats'
import { ExpenseList } from '../components/expense/ExpenseList'
import { ExpenseForm } from '../components/expense/ExpenseForm'
import { CategoryBreakdown } from '../components/expense/CategoryBreakdown'
import { QuickEntryGrid } from '../components/expense/QuickEntryGrid'
import { useExpenses, useCopyFromPreviousMonth } from '../hooks/useExpenses'
import { usePreferences, useUpdatePreferences } from '../hooks/usePreferences'
import type { ExpenseRecord } from '../types/expense'

function now(): string {
  return new Date().toISOString().slice(0, 7)
}

function shift(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(m: string): string {
  const [y, mo] = m.split('-').map(Number)
  return new Date(y, mo - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

type CopyStatus = 'idle' | 'success' | 'empty' | 'duplicate'

export default function ExpensePage() {
  const currentMonth = now()
  const [month, setMonth] = useState(currentMonth)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [editing, setEditing] = useState<ExpenseRecord | null>(null)
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const [prefSynced, setPrefSynced] = useState(false)

  const { data: prefs } = usePreferences()
  const { mutate: updatePrefs } = useUpdatePreferences()
  const { mutate: copyPrev, isPending: isCopying } = useCopyFromPreviousMonth(month)

  // Sync last-viewed month from backend on first load
  useEffect(() => {
    if (prefSynced || !prefs) return
    setPrefSynced(true)
    const saved = prefs.expenseViewMonth
    if (saved && saved <= currentMonth) setMonth(saved)
  }, [prefs, prefSynced, currentMonth])

  const handleMonthChange = useCallback((delta: number) => {
    setMonth((m) => {
      const next = shift(m, delta)
      updatePrefs({ expenseViewMonth: next })
      return next
    })
  }, [updatePrefs])

  const handleSearchChange = useCallback((q: string) => {
    setSearch(q)
    const timer = setTimeout(() => setDebouncedSearch(q), 300)
    return () => clearTimeout(timer)
  }, [])

  const { data: records = [], isLoading } = useExpenses({ month, q: debouncedSearch })

  function handleCopy() {
    setCopyStatus('idle')
    copyPrev(undefined, {
      onSuccess: (count) => {
        setCopyStatus(count === 0 ? 'empty' : 'success')
        setTimeout(() => setCopyStatus('idle'), 3000)
      },
      onError: (err: unknown) => {
        const status = (err as { response?: { status: number } }).response?.status
        setCopyStatus(status === 409 ? 'duplicate' : 'idle')
        setTimeout(() => setCopyStatus('idle'), 3000)
      },
    })
  }

  const copyLabel: Record<CopyStatus, string> = {
    idle: 'Copy from prev month',
    success: 'Copied!',
    empty: 'Nothing to copy',
    duplicate: 'Already copied',
  }

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        {/* Header + month nav */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-xl font-bold text-theme-text">Expense Tracker</h1>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {/* Copy from previous month */}
            <button
              onClick={handleCopy}
              disabled={isCopying || month <= shift(currentMonth, -12)}
              aria-label="Copy expenses from previous month"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                ${copyStatus === 'success' ? 'border-green-500 text-green-600 bg-green-500/10' :
                  copyStatus === 'duplicate' || copyStatus === 'empty' ? 'border-amber-400 text-amber-600 bg-amber-400/10' :
                  'border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-bg-alt bg-theme-card'}`}
            >
              {copyStatus === 'success' ? <Check size={13} /> :
               copyStatus === 'duplicate' || copyStatus === 'empty' ? <AlertCircle size={13} /> :
               isCopying ? <div className="w-3 h-3 rounded-full border-2 border-theme-muted border-t-transparent animate-spin" /> :
               <Copy size={13} />}
              {isCopying ? 'Copying…' : copyLabel[copyStatus]}
            </button>

            {/* Month nav */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMonthChange(-1)}
                aria-label="Previous month"
                className="p-2 rounded-lg bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-bg-alt transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold text-theme-text min-w-[140px] text-center select-none">
                {monthLabel(month)}
              </span>
              <button
                onClick={() => handleMonthChange(1)}
                disabled={month >= currentMonth}
                aria-label="Next month"
                className="p-2 rounded-lg bg-theme-card border border-theme-border text-theme-muted hover:text-theme-text hover:bg-theme-bg-alt transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Summary stat cards — auto-updates when grid adds an expense */}
        <ExpenseStats month={month} />

        {/* Inline quick-entry grid */}
        <QuickEntryGrid month={month} />

        {/* Donut breakdown */}
        <CategoryBreakdown month={month} />

        {/* Expense log */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-theme-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <ExpenseList
            records={records}
            onEdit={(r) => setEditing(r)}
            search={search}
            onSearchChange={handleSearchChange}
          />
        )}
      </div>

      {editing && <ExpenseForm record={editing} onClose={() => setEditing(null)} />}
    </PageWrapper>
  )
}
