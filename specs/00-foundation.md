# 00-FE — Frontend Foundation

**Goal:** Scaffold the Vite + React + TypeScript project with design tokens, API client, auth flow, global layout shell, and route structure.

**Depends on:** 00-backend.md

---

## User Story

As a developer, I want a fully configured frontend shell with auth and API client so every subsequent feature builds into a consistent, themed, authenticated layout.

---

## Screens / Components

- `LoginPage` / `RegisterPage` — auth forms, redirect to `/dashboard` on success
- `ProtectedRoute` — wrapper that redirects unauthenticated users to `/login`
- `AppShell` — fixed sidebar + main content area, responsive drawer on mobile
- `Sidebar` — nav links with Lucide icons, active state, user avatar + logout
- `TopBar` — page title + optional action slot
- `PageWrapper` — content container with consistent padding
- `NotFound` — 404 fallback

---

## Data Shape

```typescript
interface AuthUser {
  id: string
  email: string
}

interface AuthStore {
  user: AuthUser | null
  accessToken: string | null
  setAuth: (user: AuthUser, token: string) => void
  logout: () => void
}
```

## State

- Zustand store: `useAuthStore` — `user`, `accessToken`, `setAuth()`, `logout()`
- Persist `accessToken` to `sessionStorage` (not localStorage — security)
- TanStack Query `QueryClient` with global defaults: `staleTime: 5min`, `retry: 1`

---

## API Client (`src/lib/api.ts`)

```typescript
// Axios instance with base URL from VITE_API_URL
// Request interceptor: attach Authorization: Bearer <accessToken>
// Response interceptor: on 401 → call /auth/refresh → retry once → logout
```

---

## Routes

| Path | Component | Guard |
|------|-----------|-------|
| `/login` | `LoginPage` | public |
| `/register` | `RegisterPage` | public |
| `/` | redirect → `/dashboard` | protected |
| `/dashboard` | `DashboardPage` | protected |
| `/portfolio` | `PortfolioPage` | protected |
| `/calculator` | `CalculatorPage` | protected |
| `/health` | `HealthPage` | protected |
| `/goals` | `GoalsPage` | protected |
| `*` | `NotFound` | — |

---

## Design Tokens (tailwind.config.js extensions)

```js
colors: {
  brand: { 50:'#f0fdf4', 500:'#22c55e', 700:'#15803d', 900:'#14532d' },
  surface: { DEFAULT:'#0f172a', card:'#1e293b', border:'#334155' },
  text: { primary:'#f1f5f9', muted:'#94a3b8' },
  warning: '#f59e0b', danger: '#ef4444', success: '#22c55e',
}
fontFamily: { sans: ['Inter','sans-serif'], mono: ['JetBrains Mono','monospace'] }
```

Dark-first theme. No light mode toggle.

---

## Key Logic

- Lazy-load all page components with `React.lazy` + `Suspense`
- `ProtectedRoute` checks `useAuthStore.accessToken`; if null → redirect `/login`
- On app boot: attempt `/auth/refresh` once using stored refresh token (httpOnly cookie) → restore session silently
- Sidebar collapses to icon-only at `md:`, full drawer below `md:`

---

## Acceptance Criteria

- [ ] Register → Login flow works end-to-end against the backend
- [ ] Unauthenticated users redirected to `/login`
- [ ] Axios interceptor refreshes token on 401 transparently
- [ ] All 5 protected routes render placeholder content
- [ ] Logout clears store + redirects to `/login`
- [ ] Mobile drawer works at 375px
- [ ] No TypeScript errors

---

## /fe Prompt

> Build the frontend foundation per `specs/00-foundation.md`. Stack: React 18 + Vite + TypeScript + Tailwind CSS + Zustand + TanStack Query + React Router v6 + Axios. API at VITE_API_URL. Dark fintech theme, green brand.
