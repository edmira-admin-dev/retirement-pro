import { useFireUIStore, type InputTab } from '../../stores/fireUIStore'

const TABS: { id: InputTab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'income', label: 'Income' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'liabilities', label: 'Liabilities' },
  { id: 'assumptions', label: 'Assumptions' },
]

export const InputTabs = () => {
  const { activeTab, setActiveTab } = useFireUIStore()

  return (
    <div className="overflow-x-auto scrollbar-none -mx-1 px-1">
      <div className="flex gap-1 min-w-max snap-x snap-mandatory pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`snap-start px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-theme-primary text-white'
                : 'bg-theme-bg-alt text-theme-muted hover:text-theme-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
