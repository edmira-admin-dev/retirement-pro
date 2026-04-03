# Specs Index — Retirement Pro (Desi FIRE Dashboard)

> Updated: 2026-04-03 | Stack: Node.js + Express + TypeScript + MySQL (Hostinger) + Prisma (backend) · React 18 + Vite + TypeScript + Tailwind CSS + Recharts + Zustand + TanStack Query (frontend)

## Build Order

| # | File | Feature | Depends On | Status |
|---|------|---------|-----------|--------|
| 00-be | 00-backend.md | Node/Express scaffold + Prisma schema + JWT auth | — | [ ] |
| 00-fe | 00-foundation.md | React scaffold + design tokens + routing shell + API client | 00-be | [ ] |
| 01 | 01-portfolio-ledger.md | Multi-asset holdings CRUD (MF/NPS/EPF/PPF/Stocks) | 00-fe | [ ] |
| 02 | 02-fire-calculator.md | FIRE corpus calculator — persist inputs/results | 01 | [ ] |
| 03 | 03-projection-chart.md | Corpus growth projection charts (Recharts) | 02 | [ ] |
| 04 | 04-health-score.md | Financial wellness diagnostic (6-pillar health score) | 01 | [ ] |
| 05 | 05-goal-tracker.md | FIRE goal + milestone sub-goals CRUD | 02 | [ ] |
| 06 | 06-gamification.md | Achievement badges + streaks + behavioral nudges | 05 | [ ] |
| 07 | 07-tax-alerts.md | LTCG harvesting alerts + 3-bucket allocation | 01 | [ ] |

## How to Use

Build backend first, then pass each frontend spec to `/fe` in order:

```
/fe @specs/00-backend.md        ← backend scaffold (Node/Express/Prisma)
/fe @specs/00-foundation.md     ← frontend scaffold
/fe @specs/01-portfolio-ledger.md
/fe @specs/02-fire-calculator.md
...
```

Mark `[ ]` → `[x]` as each feature is built.

## Global Invariants (apply to every spec)

- SWR: 3% (Rule of 33x corpus)
- Inflation: General 6%, Medical 12%, Urban Lifestyle 8%
- Life expectancy default: 90 years; default retirement age: 45
- Tax: LTCG 12.5% on gains > ₹1.25L; NPS annuity 20% mandatory
- All monetary values in Indian Rupees (₹), stored as integers (paise) in DB
- Auth: JWT (access 15m + refresh 7d); all routes except /auth/* require `Authorization: Bearer <token>`
- API base URL: `http://localhost:3001/api/v1` (dev); env var `VITE_API_URL` on frontend
- DB: MySQL (Hostinger) via Prisma ORM; run `prisma migrate dev` before starting
