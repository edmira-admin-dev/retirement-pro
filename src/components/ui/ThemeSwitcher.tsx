import { useState, useRef, useEffect } from 'react'
import { Palette } from 'lucide-react'
import { useTheme, type ThemeColor } from '../../contexts/ThemeContext'

interface ThemeOption {
  value: ThemeColor
  label: string
  color: string
}

const OPTIONS: ThemeOption[] = [
  { value: 'green',  label: 'Teal Green',   color: '#00796B' },
  { value: 'blue',   label: 'Ocean Blue',   color: '#1E88E5' },
  { value: 'purple', label: 'Royal Purple', color: '#7B1FA2' },
  { value: 'grey',   label: 'Slate Grey',   color: '#546E7A' },
  { value: 'yellow', label: 'Amber Gold',   color: '#F9A825' },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const active = OPTIONS.find((o) => o.value === theme)!

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-theme-border bg-theme-card hover:bg-theme-bg-alt transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
        aria-label="Switch colour theme"
        title="Switch theme"
      >
        <span
          className="w-3.5 h-3.5 rounded-full shrink-0"
          style={{ backgroundColor: active.color }}
          aria-hidden="true"
        />
        <Palette size={13} className="text-theme-muted" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-44 rounded-xl border border-theme-border bg-theme-card shadow-lg py-1.5">
          <p className="px-3 py-1 text-[10px] font-semibold text-theme-muted uppercase tracking-widest">
            Colour theme
          </p>
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setTheme(opt.value); setOpen(false) }}
              className={[
                'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer hover:bg-theme-bg-alt',
                theme === opt.value ? 'font-semibold text-theme-text' : 'font-normal text-theme-text-sec',
              ].join(' ')}
            >
              <span
                className="w-4 h-4 rounded-full shrink-0 border-2"
                style={{
                  backgroundColor: opt.color,
                  borderColor: theme === opt.value ? opt.color : 'transparent',
                  outline: theme === opt.value ? `2px solid ${opt.color}` : 'none',
                  outlineOffset: '1px',
                }}
                aria-hidden="true"
              />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
