import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { ResearchSection } from '../../utils/parseResearchDoc'
import type { ParsedScorecard } from '../../utils/parseScorecard'
import type { ParsedScenarios } from '../../utils/parseScenarios'
import { ScorecardTable } from './ScorecardTable'
import { ScenarioTable } from './ScenarioTable'
import { ResearchSectionContent } from './ResearchSectionContent'
import { insertSentenceBreaks } from '../../utils/sentenceBreaks'

function shortTitle (title: string) {
  return title.replace(/^Section\s+\d+:?\s*[-–—]?\s*/i, '')
}

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface StockTabsPanelProps {
  summary?: string
  scorecard?: ParsedScorecard | null
  scorecardTitle?: string
  scenarios?: ParsedScenarios | null
  scenariosTitle?: string
  sections: ResearchSection[]
}

export function StockTabsPanel ({ summary, scorecard, scorecardTitle, scenarios, scenariosTitle, sections }: StockTabsPanelProps) {
  const tabs: Tab[] = []

  if (summary) {
    tabs.push({ id: '__overview', label: 'Overview', content: <div className="prose-research"><ReactMarkdown>{insertSentenceBreaks(summary)}</ReactMarkdown></div> })
  }
  if (scorecard) {
    tabs.push({ id: '__scorecard', label: scorecardTitle ? shortTitle(scorecardTitle) : 'Scorecard', content: <ScorecardTable scorecard={scorecard} /> })
  }
  if (scenarios) {
    tabs.push({ id: '__scenarios', label: scenariosTitle ? shortTitle(scenariosTitle) : 'Scenarios', content: <ScenarioTable scenarios={scenarios} /> })
  }
  for (const s of sections) {
    tabs.push({ id: s.id, label: shortTitle(s.title), content: <ResearchSectionContent section={s} /> })
  }

  const [activeId, setActiveId] = useState(tabs[0]?.id)
  const active = tabs.find(t => t.id === activeId) ?? tabs[0]

  if (!active) return null

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl min-w-0">
      <div className="flex flex-wrap gap-1 border-b border-theme-border px-2 pt-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={`shrink-0 px-3 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-px ${
              t.id === active.id
                ? 'border-theme-primary text-theme-primary'
                : 'border-transparent text-theme-text-sec hover:text-theme-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">{active.content}</div>
    </div>
  )
}
