import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ResearchSection } from '../../utils/parseResearchDoc'
import { parseScorecard } from '../../utils/parseScorecard'
import { ScorecardTable } from './ScorecardTable'
import { parseScenarios } from '../../utils/parseScenarios'
import { ScenarioTable } from './ScenarioTable'
import { insertSentenceBreaks } from '../../utils/sentenceBreaks'

export function ResearchSectionContent ({ section }: { section: ResearchSection }) {
  const scorecard = /scorecard/i.test(section.title) ? parseScorecard(section.content) : null
  const scenarios = !scorecard && /bull.*bear|bear.*bull|scenario/i.test(section.title) ? parseScenarios(section.content) : null

  return (
    <div className="prose-research">
      {scorecard ? (
        <ScorecardTable scorecard={scorecard} />
      ) : scenarios ? (
        <ScenarioTable scenarios={scenarios} />
      ) : (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ children }) => <div className="overflow-x-auto"><table>{children}</table></div>,
          }}
        >
          {insertSentenceBreaks(section.content)}
        </ReactMarkdown>
      )}
    </div>
  )
}
