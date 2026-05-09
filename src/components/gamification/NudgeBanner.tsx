import { X, Lightbulb } from 'lucide-react'
import { useGamificationUIStore } from '../../stores/gamificationUIStore'
import { useGamification, useUpdateGamification, getNudgeMessage } from '../../hooks/useGamification'

export function NudgeBanner() {
  const { activeNudge, dismissNudge } = useGamificationUIStore()
  const { data: gamData } = useGamification()
  const { mutate: update } = useUpdateGamification()

  if (!activeNudge) return null

  const message = getNudgeMessage(activeNudge)
  if (!message) return null

  function handleDismiss() {
    if (!activeNudge || !gamData) return
    dismissNudge()
    update({
      dismissedNudges: [...gamData.dismissedNudges, activeNudge],
    })
  }

  return (
    <div className="mx-4 mt-3 mb-0 flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
      <Lightbulb size={16} className="text-blue-400 shrink-0" />
      <p className="flex-1 text-sm text-theme-text leading-snug">{message}</p>
      <button
        onClick={handleDismiss}
        className="p-1 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary shrink-0"
        aria-label="Dismiss tip"
      >
        <X size={14} />
      </button>
    </div>
  )
}
