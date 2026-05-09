import { useRef } from 'react'
import { useFireUIStore } from '../../stores/fireUIStore'
import { useSaveExtendedFireProfile } from '../../hooks/useFireProfile'
import type {
  ExtendedFireInputs,
  FireInputs,
  ExpenseCategory,
  IncomeInputs,
  AssetAllocation,
  LiabilityItem,
  NpsInputs,
  RetirementAssumptions,
} from '../../types/fire'
import { InputTabs } from './InputTabs'
import { ProfileTab } from './tabs/ProfileTab'
import { ExpensesTab } from './tabs/ExpensesTab'
import { IncomeTab } from './tabs/IncomeTab'
import { PortfolioTab } from './tabs/PortfolioTab'
import { LiabilitiesTab } from './tabs/LiabilitiesTab'
import { AssumptionsTab } from './tabs/AssumptionsTab'

interface InputPanelProps {
  inputs: ExtendedFireInputs
  section80cUtilization: number
  onChange: (inputs: ExtendedFireInputs) => void
}

export const InputPanel = ({ inputs, section80cUtilization, onChange }: InputPanelProps) => {
  const { activeTab } = useFireUIStore()
  const { mutate: save } = useSaveExtendedFireProfile()
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const latestRef = useRef(inputs)
  latestRef.current = inputs

  const patch = (partial: Partial<ExtendedFireInputs>) => {
    const updated = { ...latestRef.current, ...partial }
    onChange(updated)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(updated), 800)
  }

  const handleBlur = () => {
    clearTimeout(saveTimer.current)
    save(latestRef.current)
  }

  const patchBase = (p: Partial<FireInputs>) => patch({ base: { ...inputs.base, ...p } })
  const patchAssumptions = (p: Partial<RetirementAssumptions>) =>
    patch({ assumptions: { ...(inputs.assumptions ?? { withdrawalRate: 3.5, generalInflation: 6, medicalInflation: 10 }), ...p } })

  return (
    <div className="bg-theme-card border border-theme-border rounded-xl p-5 flex flex-col gap-5">
      <InputTabs />

      {activeTab === 'profile' && (
        <ProfileTab base={inputs.base} onChange={patchBase} onBlur={handleBlur} />
      )}
      {activeTab === 'expenses' && (
        <ExpensesTab
          expenses={inputs.expenses}
          assumptions={inputs.assumptions ?? { withdrawalRate: 3.5, generalInflation: 6, medicalInflation: 10 }}
          onExpensesChange={(expenses: ExpenseCategory[] | null) => patch({ expenses })}
          onAssumptionsChange={patchAssumptions}
          onBlur={handleBlur}
        />
      )}
      {activeTab === 'income' && (
        <IncomeTab
          income={inputs.income}
          onChange={(income: IncomeInputs | null) => patch({ income })}
          onBlur={handleBlur}
        />
      )}
      {activeTab === 'portfolio' && (
        <PortfolioTab
          allocation={inputs.allocation}
          nps={inputs.nps}
          currentAge={inputs.base.currentAge}
          onAllocationChange={(allocation: AssetAllocation | null) => patch({ allocation })}
          onNpsChange={(nps: NpsInputs | null) => patch({ nps })}
          onBlur={handleBlur}
        />
      )}
      {activeTab === 'liabilities' && (
        <LiabilitiesTab
          liabilities={inputs.liabilities}
          onChange={(liabilities: LiabilityItem[] | null) => patch({ liabilities })}
          onBlur={handleBlur}
        />
      )}
      {activeTab === 'assumptions' && (
        <AssumptionsTab
          assumptions={inputs.assumptions ?? { withdrawalRate: 3.5, generalInflation: 6, medicalInflation: 10 }}
          section80cUtilization={section80cUtilization}
          onChange={patchAssumptions}
          onBlur={handleBlur}
        />
      )}
    </div>
  )
}
