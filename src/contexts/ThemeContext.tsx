// retirement-pro/src/contexts/ThemeContext.tsx
// Updated to match the design-system token contract (Retirement Pro Design System).
// - Default theme is now BLUE.
// - Adds accent, accent-light, card-alt, and gradient tokens.
// - Theme key 'blue' is the canonical default and is the value persisted on first load.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from 'react'

export type ThemeColor = 'blue' | 'green' | 'purple' | 'grey' | 'yellow'

interface ThemeVars {
  '--theme-bg': string
  '--theme-bg-alt': string
  '--theme-card': string
  '--theme-card-alt': string
  '--theme-primary': string
  '--theme-primary-dark': string
  '--theme-primary-light': string
  '--theme-accent': string
  '--theme-accent-light': string
  '--theme-text': string
  '--theme-text-sec': string
  '--theme-muted': string
  '--theme-border': string
  '--theme-success': string
  '--theme-warning': string
  '--gradient-primary': string
}

const g = (a: string, b: string) =>
  `linear-gradient(135deg, ${a} 0%, ${b} 100%)`

const THEME_VARS: Record<ThemeColor, ThemeVars> = {
  blue: {
    '--theme-bg': '#F5F9FC',
    '--theme-bg-alt': '#E3F2FD',
    '--theme-card': '#FFFFFF',
    '--theme-card-alt': '#EBF5FB',
    '--theme-primary': '#1E88E5',
    '--theme-primary-dark': '#1565C0',
    '--theme-primary-light': '#42A5F5',
    '--theme-accent': '#00ACC1',
    '--theme-accent-light': '#4DD0E1',
    '--theme-text': '#0D47A1',
    '--theme-text-sec': '#1565C0',
    '--theme-muted': '#90A4AE',
    '--theme-border': '#B3D4F0',
    '--theme-success': '#26A69A',
    '--theme-warning': '#FFA726',
    '--gradient-primary': g('#1E88E5', '#42A5F5')
  },
  green: {
    '--theme-bg': '#F1F8F7',
    '--theme-bg-alt': '#E0F2F1',
    '--theme-card': '#FFFFFF',
    '--theme-card-alt': '#E8F5E9',
    '--theme-primary': '#00796B',
    '--theme-primary-dark': '#004D40',
    '--theme-primary-light': '#26A69A',
    '--theme-accent': '#009688',
    '--theme-accent-light': '#4DB6AC',
    '--theme-text': '#004D40',
    '--theme-text-sec': '#00695C',
    '--theme-muted': '#4DB6AC',
    '--theme-border': '#B2DFDB',
    '--theme-success': '#66BB6A',
    '--theme-warning': '#FFA726',
    '--gradient-primary': g('#00796B', '#26A69A')
  },
  purple: {
    '--theme-bg': '#F8F5FA',
    '--theme-bg-alt': '#F3E5F5',
    '--theme-card': '#FFFFFF',
    '--theme-card-alt': '#F3E5F5',
    '--theme-primary': '#7B1FA2',
    '--theme-primary-dark': '#6A1B9A',
    '--theme-primary-light': '#9C27B0',
    '--theme-accent': '#AB47BC',
    '--theme-accent-light': '#CE93D8',
    '--theme-text': '#4A148C',
    '--theme-text-sec': '#6A1B9A',
    '--theme-muted': '#9575CD',
    '--theme-border': '#DEC8E8',
    '--theme-success': '#66BB6A',
    '--theme-warning': '#FFA726',
    '--gradient-primary': g('#7B1FA2', '#9C27B0')
  },
  grey: {
    '--theme-bg': '#F5F7FA',
    '--theme-bg-alt': '#ECEFF1',
    '--theme-card': '#FFFFFF',
    '--theme-card-alt': '#F5F7FA',
    '--theme-primary': '#546E7A',
    '--theme-primary-dark': '#37474F',
    '--theme-primary-light': '#78909C',
    '--theme-accent': '#607D8B',
    '--theme-accent-light': '#90A4AE',
    '--theme-text': '#263238',
    '--theme-text-sec': '#455A64',
    '--theme-muted': '#78909C',
    '--theme-border': '#CFD8DC',
    '--theme-success': '#66BB6A',
    '--theme-warning': '#FFB74D',
    '--gradient-primary': g('#546E7A', '#78909C')
  },
  yellow: {
    '--theme-bg': '#FFFEF7',
    '--theme-bg-alt': '#FFF9E6',
    '--theme-card': '#FFFFFF',
    '--theme-card-alt': '#FFFEF7',
    '--theme-primary': '#F9A825',
    '--theme-primary-dark': '#F57F17',
    '--theme-primary-light': '#FDD835',
    '--theme-accent': '#FFB300',
    '--theme-accent-light': '#FFD54F',
    '--theme-text': '#4E3600',
    '--theme-text-sec': '#795B00',
    '--theme-muted': '#9E8000',
    '--theme-border': '#FFE082',
    '--theme-success': '#66BB6A',
    '--theme-warning': '#FF7043',
    '--gradient-primary': g('#F9A825', '#FDD835')
  }
}

interface ThemeContextType {
  theme: ThemeColor
  setTheme: (theme: ThemeColor) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
const STORAGE_KEY = 'wealthpro-theme'

export function ThemeProvider ({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved in THEME_VARS) return saved as ThemeColor
    return 'blue'
  })

  function setTheme (next: ThemeColor) {
    setThemeState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  useEffect(() => {
    const vars = THEME_VARS[theme]
    const root = document.documentElement
    Object.entries(vars).forEach(([key, value]) =>
      root.style.setProperty(key, value)
    )
    root.dataset.theme = theme
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme () {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
