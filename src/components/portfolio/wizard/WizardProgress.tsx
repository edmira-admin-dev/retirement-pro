import { Check } from 'lucide-react'

interface WizardProgressProps {
  steps: string[]
  currentIndex: number
}

export function WizardProgress({ steps, currentIndex }: WizardProgressProps) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto scrollbar-thin px-1">
      {steps.map((label, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <div key={label} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                  done
                    ? 'bg-theme-primary text-white'
                    : active
                    ? 'bg-theme-primary/20 border-2 border-theme-primary text-theme-primary'
                    : 'bg-theme-border text-theme-muted',
                ].join(' ')}
              >
                {done ? <Check size={13} /> : <span>{i + 1}</span>}
              </div>
              <span
                className={`text-[10px] whitespace-nowrap hidden sm:block ${
                  active ? 'text-theme-primary font-medium' : done ? 'text-theme-text' : 'text-theme-muted'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-6 sm:w-8 mx-0.5 mt-[-10px] sm:mt-[-18px] ${done ? 'bg-theme-primary' : 'bg-theme-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
