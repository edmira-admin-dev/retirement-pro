# retirement-pro

Desi FIRE — Indian retirement planning dashboard. Full-stack: React 18 + Vite + TS + Tailwind + Recharts + Zustand + TanStack Query (frontend); Node + Express + TS + Prisma + MySQL (backend). Auth: JWT (15m access + 7d refresh via httpOnly cookie).

## Architecture

- Money in DB as paise (integer); divide by 100 for display
- Financial calculations are client-side only — server stores inputs, not results
- API base: `http://localhost:3001/api/v1` (`VITE_API_URL`)
- Zustand = UI state (modals, toggles); TanStack Query = all server state
- No localStorage for user data

## Code Style

- TypeScript strict — no `any`
- Components: PascalCase, one per file, named export; pages: default export
- Hooks: `use` prefix; pure utils in `src/utils/`
- Tailwind only — no inline styles, no arbitrary colors
- Mobile-first: start at 375px, breakpoints sm/md/lg/xl/2xl
- Components under 150 lines — split if larger
- No comments unless the WHY is non-obvious; no commented-out code
- No error handling for impossible scenarios; trust framework guarantees

## Styling Tokens

```
Primary:   indigo-600 / indigo-700 (CTAs, active states)
Surface:   white / gray-50 (cards), gray-900 (dark bg)
Text:      gray-900 (primary), gray-500 (muted), white (on-dark)
Border:    gray-200 (light), gray-700 (dark)
Success:   green-600 | Warning: amber-500 | Danger: red-500
Radius:    rounded-xl (cards), rounded-lg (inputs), rounded-full (badges)
Shadow:    shadow-sm (cards), shadow-md (modals)
Spacing:   4/6/8/12/16 multiples only
```

## Session Start

Only read `TASK.md` when a skill command is invoked (`/fe`, `/be`, `/qa`, `/sync`, `/po`, etc.). For all other requests — bug fixes, questions, ad-hoc changes — do NOT read `TASK.md`. Derive context from the files relevant to the task only.

## Routes

```
/dashboard       DashboardPage
/portfolio       PortfolioPage
/calculator      CalculatorPage
/health          HealthPage
/goals           GoalsPage
/income          IncomePage          (spec 08)
/expenses        ExpensesPage        (spec 09)
/liabilities     LiabilitiesPage     (spec 11)
/cashflow        CashFlowPage        (spec 12)
/networth        NetWorthPage        (spec 13)
/trading         TradingJournalPage  (spec 14)
/trading/kite    KitePage            (spec 15)
/allocation      AllocationPage      (spec 16)
/analytics       FactorAnalysisPage  (spec 17)
```

New routes for specs 08–18 follow `specs/roadmap-v2.md` build phases. Phase 1 first: 08 → 09 → 10 → 11.

## Token-Conservative Habits

- Read only the files you need — never glob the entire repo
- Prefer Grep/Glob over reading full files when locating symbols
- Edit existing files; never rewrite unless structure fundamentally changes
- Keep responses short: results + next action, no summaries of what was just done
- One tool call per logical action; batch independent calls in parallel
- Skip boilerplate explanations — the code is self-documenting
- Use `/fe`, `/be`, `/qa`, `/sync` skills — they scope work correctly

## Stack is Fixed

Do not suggest alternatives. Use `/fe` to build features, `/be` for API, `/qa` for tests.
