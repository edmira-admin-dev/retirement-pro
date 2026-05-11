import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useAddTrade, useUpdateTrade } from '../../hooks/useTrades'
import { toPaise, toRupees } from '../../utils/money'
import type { Trade, Exchange, Segment, TradeType, TradePayload } from '../../types/trade'

interface TradeFormProps {
  trade: Trade | null
  onClose: () => void
}

const today = () => new Date().toISOString().slice(0, 10)

export function TradeForm({ trade, onClose }: TradeFormProps) {
  const { mutate: addTrade, isPending: isAdding } = useAddTrade()
  const { mutate: updateTrade, isPending: isUpdating } = useUpdateTrade()
  const isPending = isAdding || isUpdating

  const [symbol, setSymbol] = useState(trade?.symbol ?? '')
  const [exchange, setExchange] = useState<Exchange>(trade?.exchange ?? 'NSE')
  const [segment, setSegment] = useState<Segment>(trade?.segment ?? 'EQ')
  const [tradeType, setTradeType] = useState<TradeType>(trade?.tradeType ?? 'BUY')
  const [quantity, setQuantity] = useState(trade ? String(trade.quantity) : '')
  const [price, setPrice] = useState(trade ? String(toRupees(trade.pricePaise)) : '')
  const [date, setDate] = useState(trade?.date ?? today())
  const [brokerage, setBrokerage] = useState(trade ? String(toRupees(trade.brokeragePaise)) : '')
  const [notes, setNotes] = useState(trade?.notes ?? '')

  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = '' } }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: TradePayload = {
      symbol: symbol.toUpperCase(),
      exchange, segment, tradeType,
      quantity: parseInt(quantity, 10),
      pricePaise: toPaise(parseFloat(price)),
      date,
      brokeragePaise: brokerage ? toPaise(parseFloat(brokerage)) : 0,
      notes: notes || null,
    }
    if (trade) {
      updateTrade({ id: trade.id, ...payload }, { onSuccess: onClose })
    } else {
      addTrade(payload, { onSuccess: onClose })
    }
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-theme-border bg-theme-bg-alt text-theme-text text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary'
  const labelCls = 'block text-xs font-semibold text-theme-muted mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-theme-card rounded-2xl shadow-md w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-theme-border">
          <h2 className="font-bold text-theme-text">{trade ? 'Edit Trade' : 'Log Trade'}</h2>
          <button onClick={onClose} className="text-theme-muted hover:text-theme-text cursor-pointer" aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls} htmlFor="tf-symbol">Symbol</label>
              <input id="tf-symbol" type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} required placeholder="RELIANCE" className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="tf-exchange">Exchange</label>
              <select id="tf-exchange" value={exchange} onChange={(e) => setExchange(e.target.value as Exchange)} className={inputCls}>
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="tf-segment">Segment</label>
              <select id="tf-segment" value={segment} onChange={(e) => setSegment(e.target.value as Segment)} className={inputCls}>
                <option value="EQ">EQ</option>
                <option value="FO">F&amp;O</option>
                <option value="CDS">CDS</option>
                <option value="MF">MF</option>
              </select>
            </div>
          </div>

          <div>
            <p className={labelCls}>Trade Type</p>
            <div className="flex rounded-lg overflow-hidden border border-theme-border">
              {(['BUY', 'SELL'] as TradeType[]).map((t) => (
                <button key={t} type="button" onClick={() => setTradeType(t)} className={`flex-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${tradeType === t ? (t === 'BUY' ? 'bg-green-600 text-white' : 'bg-red-500 text-white') : 'bg-theme-bg-alt text-theme-muted hover:text-theme-text'}`}>{t}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="tf-qty">Quantity</label>
              <input id="tf-qty" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="tf-price">Price (₹)</label>
              <input id="tf-price" type="number" min="0.01" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="tf-date">Date</label>
              <input id="tf-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="tf-brokerage">Brokerage (₹)</label>
              <input id="tf-brokerage" type="number" min="0" step="0.01" value={brokerage} onChange={(e) => setBrokerage(e.target.value)} placeholder="0" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="tf-notes">Notes</label>
            <textarea id="tf-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional notes…" className={`${inputCls} resize-none`} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-theme-border text-theme-text text-sm font-semibold hover:bg-theme-bg-alt transition-colors cursor-pointer">Cancel</button>
            <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60">
              {isPending ? 'Saving…' : trade ? 'Update' : 'Log Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
