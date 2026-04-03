# retirement-pro

> Claude's context file. Update as the project evolves.

## What This Is

Retirement Planning Dashboard for tracking savings, projections and goals. "Desi FIRE" — Indian-specific retirement planning.

**Type:** full-stack  
**Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + Recharts + Zustand + TanStack Query  
**Backend:** Node.js + Express + TypeScript + Prisma + MySQL (Hostinger)  
**Auth:** JWT (access 15m + refresh 7d, httpOnly cookie for refresh)  
**Created:** 2026-04-03

## Conventions

- Components: PascalCase, one per file, co-located types
- Hooks: `use` prefix
- No `any` — TypeScript strict mode
- Tailwind only — no inline styles
- Mobile-first always

## Architecture Decisions

- Money stored as paise (integer) in DB; divide by 100 for display
- All financial calculations are client-side only — server stores inputs, not results
- API base: `http://localhost:3001/api/v1`; frontend env var: `VITE_API_URL`
- Zustand = UI-only state (modals, toggles); TanStack Query = all server state
- No localStorage for user data — server is source of truth

## Session Start Protocol

On every new session, before anything else:
1. Read `TASK.md` in the project root
2. Output this briefing (under 8 lines):
   - **Status:** [paste "Current status" from TASK.md Session Briefing]
   - **Last done:** [paste "Last completed"]
   - **Next action:** [paste "Next action" — the exact /be or /fe command]
   - **Blockers:** [paste "Blockers" or "None"]
3. Wait for user instruction — do not start building until asked
4. If `TASK.md` does not exist: output "`TASK.md` not found — run `/sync` to initialize"

## Current Focus

- [ ] Initial scaffold
- [ ] Core layout
- [ ] First feature

## Notes for Claude

- Stack is fixed — do not suggest alternatives
- Read this file before making any changes
- Use /fe to scaffold and build features
