# TASK.md — Retirement Pro (Desi FIRE Dashboard)

> Last synced: 2026-04-03 12:00 | Synced by: /sync

---

## Session Briefing

**Current status:** Backend and frontend foundation both done and verified; ready to build spec 01 (Portfolio Ledger)
**Last completed:** 00-FE — Frontend Foundation (React/Vite/Auth/API client)
**Next action:** `/fe @specs/01-portfolio-ledger.md`
**Blockers:** None

---

## Build Progress

| Spec | Feature | Status | Verified |
|------|---------|--------|----------|
| 00-BE | Backend Scaffold (Node/Express/Prisma/MySQL) | [x] done | [x] |
| 00-FE | Frontend Foundation (React/Vite/Auth/API client) | [x] done | [x] |
| 01 | Portfolio Ledger (Holdings CRUD) | [ ] todo | [ ] |
| 02 | FIRE Calculator (corpus engine) | [ ] todo | [ ] |
| 03 | Projection Chart (Recharts scenarios) | [ ] todo | [ ] |
| 04 | Health Score (6-pillar diagnostic) | [ ] todo | [ ] |
| 05 | Goal Tracker (FIRE + milestones) | [ ] todo | [ ] |
| 06 | Gamification (badges + streaks) | [ ] todo | [ ] |
| 07 | Tax Alerts (LTCG + 3-bucket) | [ ] todo | [ ] |

Status: `[ ] todo` | `[~] in-progress` | `[x] done` | `[!] blocked`
Verified: `[ ]` = not confirmed | `[x]` = Tier 1 (build) + Tier 2 (human) both passed

---

## In-Progress Detail

No spec currently in-progress.

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
- [ ] Holdings load from API on page mount
- [ ] Add/edit/delete persists to DB and reflects immediately
- [ ] Net worth and donut chart update reactively
- [ ] Paise ↔ ₹ conversion transparent to the user
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

### 02 — FIRE Calculator
- [ ] Inputs auto-save to API on blur
- [ ] Inputs restored from API on page load
- [ ] `currentPortfolioValue` derived from holdings — no manual entry
- [ ] Age 30, retire 45, expense ₹50k/m, portfolio ₹0 → target ≈ ₹4.8 Cr
- [ ] "FIRE Achieved" state shown when portfolio ≥ target
- [ ] No TypeScript errors

### 03 — Projection Chart
- [ ] Chart renders from live fire store data — no hardcoded values
- [ ] Target corpus as dashed ReferenceLine
- [ ] Scenario toggle shows/hides lines
- [ ] Corpus depletion year shown if any scenario hits zero
- [ ] Tooltip shows "₹X.X Cr" format
- [ ] Readable at 375px (horizontal scroll, min-width: 600px)
- [ ] No TypeScript errors

### 04 — Health Score
- [ ] Inputs auto-save to API; restored on page load
- [ ] `totalAssets` pre-filled from holdings — read-only
- [ ] Score + all 6 pillars update on input change
- [ ] ≥3 recommendations when ≥3 ratios fail
- [ ] Mobile-responsive at 375px
- [ ] No TypeScript errors

### 05 — Goal Tracker
- [ ] Goals load from API; CRUD persists to DB
- [ ] FireGoalCard shows live FIRE calculation data
- [ ] 4 default goals seeded on empty state
- [ ] Inflation-adjusted target visible per goal
- [ ] Total pressure warning at >1.5x portfolio threshold
- [ ] No TypeScript errors

### 06 — Gamification
- [ ] Badges persist to DB; survive page refresh
- [ ] Badge unlocks on next app boot after condition met
- [ ] Streak increments on consecutive daily visits; resets on gap
- [ ] Locked badges in grayscale with unlock hint
- [ ] Nudge banner dismissal persists
- [ ] No TypeScript errors

### 07 — Tax Alerts
- [ ] Tax inputs persist to API; restored on page load
- [ ] LTCG gauge shows correct remaining limit
- [ ] Alert color changes in Feb–March
- [ ] Alert hidden when `realizedGainsFY >= ₹1.25L`
- [ ] 3-bucket chart derives from holdings
- [ ] Glide-down warning within 5 years of retirement
- [ ] No TypeScript errors

---

## Blocked Items

| Spec | Blocker | Since | Needs |
|------|---------|-------|-------|
| — | — | — | — |

---

## Session Notes

[Newest entry first]

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
- Re-scan: backend confirmed complete — all 30 source files in server/src/ present
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
