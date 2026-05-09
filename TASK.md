# TASK.md — Retirement Pro (Desi FIRE Dashboard)

> Last synced: 2026-04-05 14:30 | Synced by: /sync

---

## Session Briefing

**Current status:** All 9 specs built and build-verified; specs 02–05 and 07 awaiting Tier 2 browser confirmation
**Last completed:** 07 — Tax Alerts (LTCG + 3-bucket) — build verified, awaiting browser
**Next action:** Verify specs 02–05 and 07 in browser, then run `/sync` to mark Verified [x]
**Blockers:** None

---

## Build Progress

| Spec | Feature | Status | Verified |
|------|---------|--------|----------|
| 00-BE | Backend Scaffold (Node/Express/Prisma/MySQL) | [x] done | [x] |
| 00-FE | Frontend Foundation (React/Vite/Auth/API client) | [x] done | [x] |
| 01 | Portfolio Ledger (Holdings CRUD) | [x] done | [x] |
| 02 | FIRE Calculator (corpus engine) | [x] done | [ ] |
| 03 | Projection Chart (Recharts scenarios) | [x] done | [ ] |
| 04 | Health Score (6-pillar diagnostic) | [x] done | [ ] |
| 05 | Goal Tracker (FIRE + milestones) | [x] done | [ ] |
| 06 | Gamification (badges + streaks) | [x] done | [x] |
| 07 | Tax Alerts (LTCG + 3-bucket) | [x] done | [ ] |

Status: `[ ] todo` | `[~] in-progress` | `[x] done` | `[!] blocked`
Verified: `[ ]` = not confirmed | `[x]` = Tier 1 (build) + Tier 2 (human) both passed

---

## In-Progress Detail

No spec currently in-progress.

---

### 2026-04-05 — /fe Portfolio wizard fix + dashboard redesign

- Fixed `PortfolioWizard.tsx`:
  - "Build Portfolio" button no longer disabled — now always clickable; shows inline error when 0 entries
  - Error banner visible on any step (not buried inside StepReview)
  - `refetchQueries` replaces `invalidateQueries` so data is guaranteed fresh before wizard closes
  - Header shows live entry counter badge ("X added")
  - Subtitle updated: "fill form then click Add in each step"
- Fixed `StepFixedIncome.tsx`:
  - Removed PPF and EPF/VPF from categories
  - FD + BOND: added Started (MM/YY), Interest Payout, Duration Years/Months, Coupon/Interest Rate
  - Auto-calculates accrued current value (compound quarterly for at-maturity)
- Updated `wizardTypes.ts`: added `PayoutFrequency`, `startDate`, `termMonths`, `payoutFrequency` to WizardEntry
- New component `src/components/portfolio/PortfolioDashboard.tsx`:
  - Replaces AssetClassTabs — shows all 6 asset groups (Cash, Fixed Income, Equity, Retirement, Real Assets, Global)
  - Each group is a collapsible card with total + gain, holding grid, and inline "Add" shortcut
  - "Not started yet" section shows quick-add buttons for empty groups
- Updated `src/pages/PortfolioPage.tsx`: uses PortfolioDashboard instead of AssetClassTabs + NetWorthSummary
- Updated `src/components/portfolio/AssetEntryForm.tsx`: all 15 asset classes in grouped optgroups; HIDE_UNITS extended for non-unit assets
- Fixed `src/components/ui/MoneyInput.tsx`: removed unused `step` prop (TS warning)
- `npm run build` — zero TypeScript errors ✓ (9.47s)

### 2026-04-05 — /fe QuickAddModal (asset-class-aware add from dashboard)
- Added `initialOpen?: boolean` prop to all 8 wizard step components — auto-opens the inline form when used outside the wizard
- Updated `src/stores/portfolioUIStore.ts` — added `quickAddGroup`, `openQuickAdd(groupId)`, `closeQuickAdd()`
- New component `src/components/portfolio/QuickAddModal.tsx` — renders matching wizard step with `initialOpen={true}`; saves directly via `useAddHolding`; refetches holdings; Cash group has Bank/Liquid sub-tab; Real Assets group has Gold/Real Estate sub-tab; shows saving/saved/error status
- Updated `src/components/portfolio/PortfolioDashboard.tsx` — all "Add X" buttons call `openQuickAdd(group.id)`
- Updated `src/pages/PortfolioPage.tsx` — renders `<QuickAddModal />`
- `npm run build` — zero TypeScript errors ✓ (8.01s)

---

## Acceptance Criteria Log

### 00-BE — Backend Scaffold
- [x] `POST /auth/register` creates user, returns tokens
- [x] `POST /auth/login` validates password, returns tokens
- [x] Protected routes return 401 without valid JWT
- [x] All CRUD routes for holdings work end-to-end
- [x] `prisma db push` synced schema (Hostinger shared hosting — shadow DB not supported, `migrate dev` not used)
- [x] Server starts on port 3001

### 00-FE — Frontend Foundation
- [x] Register → Login flow works end-to-end against the backend
- [x] Unauthenticated users redirected to `/login`
- [x] Axios interceptor refreshes token on 401 transparently
- [x] All 5 protected routes render placeholder content
- [x] Logout clears store + redirects to `/login`
- [x] Mobile drawer works at 375px
- [x] `npm run build` passes — zero TypeScript errors

### 01 — Portfolio Ledger
- [x] Holdings load from API on page mount
- [x] Add/edit/delete persists to DB and reflects immediately
- [x] Net worth and donut chart update reactively
- [x] Paise ↔ ₹ conversion transparent to the user
- [x] Mobile-responsive at 375px
- [x] No TypeScript errors

### 02 — FIRE Calculator
- [ ] Inputs auto-save to API on blur
- [ ] Inputs restored from API on page load
- [ ] `currentPortfolioValue` derived from holdings — no manual entry
- [ ] Age 30, retire 45, expense ₹50k/m, portfolio ₹0 → target ≈ ₹4.8 Cr
- [ ] "FIRE Achieved" state shown when portfolio ≥ target
- [x] No TypeScript errors

### 03 — Projection Chart
- [ ] Chart renders from live fire store data — no hardcoded values
- [ ] Target corpus as dashed ReferenceLine
- [ ] Scenario toggle shows/hides lines
- [ ] Corpus depletion year shown if any scenario hits zero
- [ ] Tooltip shows "₹X.X Cr" format
- [ ] Readable at 375px (horizontal scroll, min-width: 600px)
- [x] No TypeScript errors

### 04 — Health Score
- [ ] Inputs auto-save to API; restored on page load
- [ ] `totalAssets` pre-filled from holdings — read-only
- [ ] Score + all 6 pillars update on input change
- [ ] ≥3 recommendations when ≥3 ratios fail
- [ ] Mobile-responsive at 375px
- [x] No TypeScript errors

### 05 — Goal Tracker
- [ ] Goals load from API; CRUD persists to DB
- [ ] FireGoalCard shows live FIRE calculation data
- [ ] 4 default goals seeded on empty state
- [ ] Inflation-adjusted target visible per goal
- [ ] Total pressure warning at >1.5x portfolio threshold
- [x] No TypeScript errors

### 06 — Gamification
- [x] Badges persist to DB; survive page refresh
- [x] Badge unlocks on next app boot after condition met
- [x] Streak increments on consecutive daily visits; resets on gap
- [x] Locked badges in grayscale with unlock hint
- [x] Nudge banner dismissal persists
- [x] No TypeScript errors

### 07 — Tax Alerts
- [ ] Tax inputs persist to API; restored on page load
- [ ] LTCG gauge shows correct remaining limit
- [ ] Alert color changes in Feb–March
- [ ] Alert hidden when `realizedGainsFY >= ₹1.25L`
- [ ] 3-bucket chart derives from holdings
- [ ] Glide-down warning within 5 years of retirement
- [x] No TypeScript errors

---

## Blocked Items

| Spec | Blocker | Since | Needs |
|------|---------|-------|-------|
| — | — | — | — |

---

## Session Notes

[Newest entry first]

### 2026-04-05 — /fe MoneyInput reusable component
- New util: `src/utils/money.ts` — added `rupeesToWords(n)` Indian-words converter (e.g. 150000 → "One Lakh Fifty Thousand")
- New component: `src/components/ui/MoneyInput.tsx` — reusable money input with ₹ prefix + live words subtext on every keystroke
- Updated `src/components/calculator/RupeeField.tsx` — added words subtext via `rupeesToWords`
- Updated `src/components/health/HealthInputForm.tsx` — local RupeeField updated with words subtext
- Updated `src/components/portfolio/AssetEntryForm.tsx` — currentValue + investedValue now use MoneyInput
- Updated wizard steps (all 8): StepBank, StepLiquid, StepFixedIncome, StepEquity, StepGold, StepRealEstate, StepRetirement, StepInternational — all money fields use MoneyInput
- `npm run build` — zero TypeScript errors ✓ (24.72s)

### 2026-04-05 — /fe portfolio wizard (empty state + multi-step onboarding)
- Expanded AssetClass enum: `server/prisma/schema.prisma` — added BANK, LIQUID, FD, BOND, ETF, GOLD, REAL_ESTATE, ANNUITY, INTL_EQUITY, INTL_DEBT (requires `npm run db:push`)
- Updated `src/types/holdings.ts` — AssetClass union now 15 values
- Updated `src/stores/portfolioUIStore.ts` — added wizardOpen, openWizard(), closeWizard()
- Updated `src/components/portfolio/AssetClassBadge.tsx` — 15 badges with distinct colors
- Updated `src/components/portfolio/AssetClassTabs.tsx` — grouped tabs: All / Equity / Debt / Retirement / Real Assets / Cash / Global (tabs hidden when 0 holdings in that group)
- Updated `src/components/portfolio/NetWorthSummary.tsx` — COLORS + LABELS maps for all 15 asset classes
- New component: `src/components/portfolio/wizard/WizardProgress.tsx` — step dots with check marks
- New type file: `src/components/portfolio/wizard/wizardTypes.ts` — WizardEntry, WizardStepKey, makeId()
- New wizard steps: StepBank, StepLiquid, StepFixedIncome (FD/BOND/PPF/EPF/MF), StepEquity (sub-tabs: Stocks/ETF/MF), StepGold, StepRealEstate (net equity = market value minus loan), StepRetirement (NPS/EPF/PPF/ANNUITY), StepInternational (INTL_EQUITY/INTL_DEBT, currency field, INR value)
- New component: `src/components/portfolio/wizard/steps/StepReview.tsx` — grouped summary, total net worth preview
- New component: `src/components/portfolio/wizard/PortfolioWizard.tsx` — 9-step orchestrator modal; sequential submit via useAddHolding; extra fields (return %, currency, loan) packed into notes as JSON
- Updated `src/pages/PortfolioPage.tsx` — EmptyPortfolioState (wallet icon + "Get started" → wizard + "Add single holding" → drawer); wizard renders only when holdings.length === 0; FAB hidden on empty state
- `npm run build` — zero TypeScript errors ✓ (8.25s)

### 2026-04-05 — /fe full reskin (multi-theme)
- New file: `src/contexts/ThemeContext.tsx` — ThemeProvider, 5 themes (blue/purple/grey/yellow/green), CSS variable injection on `document.documentElement`, localStorage persistence
- New file: `src/components/ui/ThemeSwitcher.tsx` — palette icon dropdown, 5 colour circles, persists to localStorage
- Updated `tailwind.config.js` — removed dark hardcoded tokens, added 12 CSS-var-driven `theme-*` colour tokens
- Updated `src/index.css` — removed dark colour-scheme, light mode base, CSS var defaults (green), scrollbar-thin uses theme var
- Updated `src/main.tsx` — wrapped app with `<ThemeProvider>`
- Updated `src/App.tsx` — spinner uses `theme-primary`
- Updated `src/components/layout/AppShell.tsx` — light bg, softer mobile overlay
- Updated `src/components/layout/Sidebar.tsx` — white card sidebar, active nav item uses `bg-theme-primary text-white`, icon logo pill
- Updated `src/components/layout/TopBar.tsx` — added `<ThemeSwitcher />` to right side
- Updated `src/components/layout/PageWrapper.tsx` — added `max-w-7xl mx-auto`
- Bulk token replacement: 43 files — all `bg-surface-*`, `text-text-*`, `bg-brand-*`, `text-brand-*` → `theme-*` equivalents
- Fixed inline Recharts colors (`#334155`, `#94a3b8`) → CSS vars (`var(--theme-border)`, `var(--theme-muted)`) in CorpusGauge, ProjectionChart, HealthScoreGauge, BucketAllocationCard
- Fixed OpdHero grid decoration → `var(--theme-primary)` line colour
- Fixed FitnessScoreCard SVG ring track → `var(--theme-border)`
- Fixed form input fields → `bg-theme-bg-alt` for contrast on light backgrounds
- Fixed modal overlays → `bg-black/30 backdrop-blur-sm` (softer for light mode)
- `npm run build` — zero TypeScript errors ✓ (25.31s)

### 2026-04-05 — /sync
- all task now.
- Scan: all spec 07 files confirmed — types/tax.ts, hooks/useTaxProfile.ts, utils/taxCalc.ts, LtcgGauge, HarvestingAlert, BucketAllocationCard, GlideDownAlert, TaxAlertsSection; server: tax.controller.ts, tax.service.ts, routes/tax.ts
- `npm run build` (frontend) — zero TS errors ✓ (6.89s)
- `npm run build` (server) — zero TS errors ✓
- 07 upgraded from [~] in-progress → [x] done — awaiting Tier 2 browser confirmation for Verified [x]
- All 9 specs now [x] done; specs 02–05 and 07 still need Tier 2 browser verification

### 2026-04-05 — /fe @specs/07-tax-alerts.md
- New types: `src/types/tax.ts` — TaxInputs, BucketAllocation, BucketIdeal
- New hook: `src/hooks/useTaxProfile.ts` — useTaxProfile (GET /tax) + useSaveTaxProfile (PUT /tax), paise conversion, 800ms debounce
- New util: `src/utils/taxCalc.ts` — computeLtcg (remaining, showAlert, isUrgent, pct), computeBuckets (from holdings), computeIdealBuckets (from fireResult)
- New components: LtcgGauge (horizontal bar, 80% marker), HarvestingAlert (amber/red urgency), BucketAllocationCard (grouped BarChart + over/under cards), GlideDownAlert (blue banner), TaxAlertsSection (orchestrator)
- Updated PortfolioPage: TaxAlertsSection rendered below holdings
- `npm run build` — zero TypeScript errors ✓ (6.38s)

### 2026-04-05 — /sync
- Scan: all spec 06 files confirmed — types/gamification.ts, stores/gamificationUIStore.ts, hooks/useGamification.ts, BadgeCard, BadgeGrid, StreakCounter, NudgeBanner; server: gamification.controller.ts, gamification.service.ts, routes/gamification.ts
- `npm run build` (frontend) — zero TS errors ✓ (6.72s)
- `npm run build` (server) — zero TS errors ✓
- User confirmed Tier 2 browser checks: prisma db push ran, BadgeGrid visible on GoalsPage, StreakCounter in TopBar, nudge banner working
- 06 marked [x] done + Verified [x]
- Argument provided: mark the task verified and completed
- Next: `/fe @specs/07-tax-alerts.md`

### 2026-04-05 — /fe @specs/06-gamification.md
- New types: `src/types/gamification.ts` — Badge, GamificationData, GamificationPatch
- New store: `src/stores/gamificationUIStore.ts` — activeNudge (Zustand)
- New hook: `src/hooks/useGamification.ts` — BADGE_DEFS (10 badges), useGamification (GET /gamification), useUpdateGamification (PATCH /gamification), useBootstrapGamification (streak + badge check on boot)
- New components: BadgeCard (earned=colored / locked=grayscale), BadgeGrid (category-grouped, earn count), StreakCounter (flame + "X days" in TopBar), NudgeBanner (dismissible, persists to API)
- Updated GoalsPage: BadgeGrid rendered at bottom
- Updated AppShell: bootstrap hook + StreakCounter as TopBar action + NudgeBanner below TopBar
- Modified useHealthProfile: returns `null` when no profile (was `DEFAULT_INPUTS`) — enables health-check badge + no-health-profile nudge
- `npm run build` — zero TypeScript errors ✓ (5.96s)

### 2026-04-05 — /sync
- Scan: all spec 05 files confirmed — GoalsPage.tsx, GoalProgressBar, FireGoalCard, MilestoneGoalCard, AddGoalModal, TotalGoalsOverview, useGoals.ts, goalsUIStore.ts, types/goals.ts
- Spec 06: no files found — no gamification components, no useGamification.ts, no tax components
- Spec 07: no files found — no tax components, no useTaxProfile.ts
- `npm run build` (frontend) — zero TS errors ✓ (built in 8.47s)
- State matches TASK.md — no status changes needed
- Next: `/fe @specs/06-gamification.md`

### 2026-04-04 — /sync
- Argument: finished goals task and move on to next tasl
- Scan: all spec 05 files confirmed — GoalsPage.tsx (real implementation, seeds 4 defaults), GoalProgressBar, FireGoalCard, MilestoneGoalCard, AddGoalModal, TotalGoalsOverview, useGoals.ts, goalsUIStore.ts, types/goals.ts
- `npm run build` (frontend) — zero TS errors ✓
- 05 upgraded from [~] in-progress → [x] done — awaiting Tier 2 browser confirmation for Verified [x]
- Next: `/fe @specs/06-gamification.md`

### 2026-04-04 — /fe @specs/05-goal-tracker.md
- Built Goal Tracker feature (spec 05)
- New types: `src/types/goals.ts` — GoalCategory, Goal, GoalInput
- New hook: `src/hooks/useGoals.ts` — useGoals / useAddGoal / useUpdateGoal / useDeleteGoal, paise↔₹ conversion
- New store: `src/stores/goalsUIStore.ts` — modalOpen, editingGoal (Zustand UI store)
- New components: GoalProgressBar (green/amber/red), FireGoalCard (FIRE corpus from calculator), MilestoneGoalCard (inline delete confirm, inflation-adj target + progress), AddGoalModal (add/edit form, excludes FIRE category), TotalGoalsOverview (sum vs portfolio, pressure warning)
- GoalsPage: seeds 4 defaults on empty state (Parents Care/Child Education/Child Wedding/Primary Home), FIRE data sourced from fireCalc + holdings
- `npm run build` — zero TypeScript errors ✓

### 2026-04-04
- Scan: all spec 04 files confirmed — HealthPage.tsx (83L), HealthInputForm, HealthScoreGauge, HealthStatusBadge, PillarGrid, RatioTable, RecommendationList, useHealthProfile, healthCalc.ts, types/health.ts
- `npm run build` (frontend) — zero TS errors ✓
- 04 upgraded from [~] in-progress → [x] done — awaiting Tier 2 browser confirmation for Verified [x]
- Next: `/fe @specs/05-goal-tracker.md`

### 2026-04-03 — /sync
- Argument: update the steps and continue with the next task
- Scan: all spec 03 files confirmed — projectionCalc.ts, ScenarioToggle.tsx, ProjectionChart.tsx, CalculatorPage.tsx (ProjectionChart imported and rendered)
- `npm run build` (frontend) — zero TS errors ✓
- 03 marked [x] done — awaiting Tier 2 browser confirmation for Verified [x]
- Next: `/fe @specs/04-health-score.md`

### 2026-04-03 — /fe 03 projection work
- Built Projection Chart feature (spec 03)
- New util: `src/utils/projectionCalc.ts` — buildProjectionData() (accumulation + distribution phase math), findDepletionAge(), ProjectionPoint / Scenario types
- New component: `src/components/calculator/ScenarioToggle.tsx` — pill toggle, keeps ≥1 scenario active
- New component: `src/components/calculator/ProjectionChart.tsx` — AreaChart with green/amber/red zone shading, dashed target ReferenceLine, depletion warning banner, 600px min-width scroll container
- Updated `src/pages/CalculatorPage.tsx` — ProjectionChart rendered full-width below the grid
- `npm run build` — zero TypeScript errors ✓

### 2026-04-03 — /sync
- Argument: mark done
- Scan: all spec 02 files confirmed — CalculatorPage (71L), InputPanel (152L), ResultPanel (118L), CorpusGauge (44L), InflationBreakdown (80L), SliderInput (57L), useFireProfile (56L), fireCalc (73L), fireUIStore, types/fire.ts
- `npm run build` (frontend) — zero TS errors ✓
- `npm run build` (server) — zero TS errors ✓
- 02 marked [x] done — awaiting Tier 2 browser confirmation for Verified [x]

### 2026-04-03 — /fe @specs/02-fire-calculator.md
- Built FIRE Calculator feature (spec 02)
- New types: `src/types/fire.ts` — FireInputs, FireResult interfaces
- New util: `src/utils/fireCalc.ts` — computeFireResult() with full spec formula (FV inflation, annuity PV, LTCG drag, SIP)
- New hook: `src/hooks/useFireProfile.ts` — useFireProfile (GET /fire) + useSaveFireProfile (PUT /fire), paise conversion
- New store: `src/stores/fireUIStore.ts` — inflationExpanded toggle
- New components: SliderInput, InputPanel (debounced 800ms auto-save), ResultPanel (FIRE Achieved state, MetricCards, CorpusGauge, healthcare callout), CorpusGauge (Recharts RadialBarChart), InflationBreakdown (expandable)
- CalculatorPage: two-column layout (lg:grid-cols-2), loads profile from API, derives currentPortfolio from holdings
- `npm run build` — zero TypeScript errors ✓

### 2026-04-03 — /sync
- Argument: do the next task
- Scan: all 00-BE, 00-FE, 01 files confirmed present in filesystem
- server/src/ — app.ts, config/, controllers/, index.ts, middleware/, routes/, services/, types/, utils/ ✓
- server/prisma/schema.prisma ✓
- src/pages/ — all 8 pages present ✓
- src/hooks/ — useBootstrap.ts, useHoldings.ts ✓
- src/components/portfolio/ — AssetClassBadge, AssetClassTabs, AssetEntryForm, HoldingCard, NetWorthSummary ✓
- src/utils/money.ts, src/stores/portfolioUIStore.ts, src/types/holdings.ts ✓
- `npm run build` (frontend) — zero TS errors ✓
- `npm run build` (server) — zero TS errors ✓
- State matches TASK.md — no changes to spec status
- Next: `/fe @specs/02-fire-calculator.md`

### 2026-04-03 — /sync
- Argument: mark 01 done + verified
- Scan: all spec 01 files confirmed — PortfolioPage (72L), useHoldings (81L), AssetClassBadge, HoldingCard, AssetEntryForm, NetWorthSummary, AssetClassTabs, types/holdings.ts, utils/money.ts, stores/portfolioUIStore.ts
- Missing hooks (useFireProfile, useHealthProfile, useGoals, useGamification, useTaxProfile) belong to specs 02–07 — not required for spec 01
- `npm run build` (frontend) — zero TS errors ✓
- `npm run build` (server) — zero TS errors ✓
- User explicitly confirmed Tier 2 browser checks (add/edit/delete, paise in Network tab, 375px layout)
- 01 marked [x] done + Verified [x]

### 2026-04-03 — /fe @specs/01-portfolio-ledger.md
- Built full Portfolio Ledger feature (spec 01)
- Installed recharts (^3.8.1)
- New files: types/holdings.ts, utils/money.ts, hooks/useHoldings.ts, stores/portfolioUIStore.ts
- New components: AssetClassBadge, HoldingCard (inline delete confirm), AssetEntryForm (drawer), NetWorthSummary (donut chart), AssetClassTabs (All/MF/NPS/EPF-PPF/Stocks)
- PortfolioPage replaced placeholder with full composition
- Paise conversion: toPaise/toRupees/formatRupees/formatRupeesCompact in utils/money.ts
- `npm run build` — zero TypeScript errors

### 2026-04-03 — /sync
- Argument: to mark 00-FE [x] done + Verified
- Scan: all 00-FE files confirmed — main.tsx, App.tsx, api.ts, authStore.ts, AppShell, Sidebar, TopBar, PageWrapper, ProtectedRoute, LoginPage, RegisterPage, 5× placeholder pages, NotFound
- Missing hooks (useHoldings, useFireProfile, etc.) belong to specs 01–07 — not required for 00-FE
- `npm run build` (frontend) — zero TS errors ✓
- `npm run build` (server) — zero TS errors ✓
- User explicitly confirmed Tier 2 browser checks (register/login flow, 401 refresh, logout, 375px drawer)
- 00-FE marked [x] done + Verified [x]
- Note: refresh token stored in sessionStorage (backend uses body-based refresh, not httpOnly cookie)

### 2026-04-03 — /fe @specs/00-foundation.md
- Built complete frontend foundation (00-FE)
- Pages: LoginPage, RegisterPage, DashboardPage, PortfolioPage, CalculatorPage, HealthPage, GoalsPage, NotFound
- Components: AppShell, Sidebar, TopBar, PageWrapper, ProtectedRoute
- Store: useAuthStore (Zustand, sessionStorage persist for accessToken + refreshToken)
- API client: Axios with Bearer interceptor + 401→refresh→retry→logout
- Hooks: useBootstrap (silent session restore on app boot)
- Routes: React Router v6, lazy-loaded pages, ProtectedRoute wrapper
- Design tokens applied via tailwind.config.js (dark fintech, green brand)
- Fix: refreshToken stored in sessionStorage and sent in body (backend is body-based, not cookie-based)
- `npm run build` — zero TypeScript errors, all chunks split by route

### 2026-04-03 — /sync (re-run)
- Re-scan: backend confirmed complete — all source files in server/src/ present
- Frontend: src/ directory did not exist — 00-FE not started
- State unchanged from previous sync — TASK.md remained accurate

### 2026-04-03 — /sync
- Scan: all backend files confirmed in server/src/ — controllers, services, routes, middleware, config
- `server/prisma/schema.prisma` — 8 models, 2 enums, all real implementation
- `npm run build` — zero TypeScript errors
- 16/16 Jest tests passing against live Hostinger MySQL
- 00-BE marked [x] done + Verified [x] — user explicitly confirmed

### 2026-04-03 — /be @specs/00-backend.md
- Built complete backend scaffold (00-BE)
- Files created: package.json, tsconfig.json, prisma/schema.prisma, src/config/, src/middleware/, src/services/, src/controllers/, src/routes/, src/app.ts, src/index.ts, tests/
- `prisma db push` succeeded — all tables created on Hostinger MySQL (shadow DB workaround)
- DB host: IPv4 `82.25.121.31` used directly — avoids IPv6 DNS resolution issue on Hostinger
- Note: `prisma migrate dev` not usable on Hostinger shared hosting (P3014 shadow DB error) — use `npm run db:push` instead

---

## Dependency Map

```
00-BE ──► 00-FE ──► 01 ──► 02 ──► 03
                     │      └────► 05 ──► 06
                     ├──────────► 04
                     └──────────► 07
```

A spec cannot START until its dependency is `[x] done` AND `Verified [x]`.
