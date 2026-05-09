/** retirement-pro/tailwind.config.js — exposes the full design-system token set. */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Theme tokens — driven by CSS variables set by ThemeContext / index.css
        'theme-bg': 'var(--theme-bg)',
        'theme-bg-alt': 'var(--theme-bg-alt)',
        'theme-card': 'var(--theme-card)',
        'theme-card-alt': 'var(--theme-card-alt)',
        'theme-primary': 'var(--theme-primary)',
        'theme-primary-dark': 'var(--theme-primary-dark)',
        'theme-primary-light': 'var(--theme-primary-light)',
        'theme-accent': 'var(--theme-accent)',
        'theme-accent-light': 'var(--theme-accent-light)',
        'theme-text': 'var(--theme-text)',
        'theme-text-sec': 'var(--theme-text-sec)',
        'theme-muted': 'var(--theme-muted)',
        'theme-border': 'var(--theme-border)',
        'theme-success': 'var(--theme-success)',
        'theme-warning': 'var(--theme-warning)',
        // Static semantic colors
        warning: '#F59E0B',
        danger: '#EF4444',
        success: '#22C55E'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px'
      },
      boxShadow: {
        sm: '0 1px 2px rgba(15,23,42,0.06)',
        md: '0 4px 12px rgba(15,23,42,0.08)',
        lg: '0 8px 24px rgba(15,23,42,0.10)',
        '2xl': '0 24px 60px rgba(15,23,42,0.12)'
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)'
      }
    }
  },
  plugins: []
}
