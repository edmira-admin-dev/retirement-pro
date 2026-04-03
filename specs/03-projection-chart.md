# 03 — Projection Chart

**Goal:** Visualize corpus growth over time across three scenarios; surface corpus depletion risk.

**Depends on:** 02-fire-calculator.md

---

## User Story

As a FIRE aspirant, I want to see my projected corpus as a multi-scenario chart so I understand my trajectory and downside risk.

---

## Screens / Components

- `ProjectionChart` — Recharts `AreaChart`, rendered on `CalculatorPage` below `ResultPanel`
- `ScenarioToggle` — multi-select pill buttons: Conservative | Base | Optimistic
- `MilestoneMarkers` — `ReferenceLine` at retirement age and life expectancy
- `ChartTooltip` — custom: age, year, corpus per active scenario, target line

---

## Data Shape

```typescript
interface ProjectionPoint {
  age: number
  year: number
  conservative: number    // ₹
  base: number
  optimistic: number
  target: number          // flat = targetCorpus from FireResult
}

type Scenario = 'conservative' | 'base' | 'optimistic'
```

## State

- No API calls — all data derived client-side from `useFireProfile()` + `useHoldings()`
- Local state: `activeScenarios: Scenario[]` — default all three active
- `ProjectionPoint[]` memoized with `useMemo`; recomputes when fire inputs change

---

## Key Logic

**Return assumptions per scenario:**
| Scenario | Pre-retirement | Post-retirement |
|----------|---------------|----------------|
| Conservative | 8% | 6% |
| Base | user input | user input |
| Optimistic | 15% | 10% |

**Accumulation phase** (currentAge → retirementAge):
`V(t) = currentPortfolio * (1+r)^t + SIP * 12 * ((1+r)^t - 1) / r`

**Distribution phase** (retirementAge → lifeExpectancy):
`V(t) = V(prev) * (1+rPost) - withdrawal(t)` where `withdrawal(t) = firstYearExpense * (1.06)^t`

- If any scenario `V(t) < 0`: mark year with `ReferenceArea` in red, add depletion annotation
- Phased shading: green background = accumulation zone; amber = distribution zone

---

## Acceptance Criteria

- [ ] Chart renders from live fire store data — no hardcoded values
- [ ] Target corpus renders as dashed `ReferenceLine`
- [ ] Toggle shows/hides individual scenario lines
- [ ] Corpus depletion year shown if any scenario hits zero
- [ ] Tooltip shows ₹ formatted values (e.g., "₹1.2 Cr")
- [ ] Readable at 375px (horizontal scroll container with min-width: 600px)
- [ ] No TypeScript errors

---

## /fe Prompt

> Build the Projection Chart per `specs/03-projection-chart.md`. Stack: React 18 + Vite + TypeScript + Tailwind CSS + Recharts + TanStack Query. All math is client-side. Render inside CalculatorPage. Dark fintech theme.
