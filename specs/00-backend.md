# 00-BE — Backend Scaffold

**Goal:** Stand up the Node.js + Express + TypeScript API server with MySQL (Hostinger) via Prisma, JWT auth, and all database tables for the full product.

**Depends on:** none

---

## User Story

As a developer, I want a running API server with auth and database schema so every frontend feature has a stable, typed endpoint to call.

---

## Project Structure

```
server/
  src/
    index.ts              # Express app entry
    middleware/
      auth.ts             # JWT verify middleware
      errorHandler.ts     # Global error handler
    routes/
      auth.ts             # POST /auth/register, /auth/login, /auth/refresh
      holdings.ts         # /holdings CRUD
      fire.ts             # /fire CRUD
      health.ts           # /health CRUD
      goals.ts            # /goals CRUD
      gamification.ts     # /gamification GET+PATCH
      tax.ts              # /tax GET+PATCH
    prisma/
      schema.prisma
  .env
  tsconfig.json
  package.json
```

---

## Prisma Schema

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  // DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DBNAME?connection_limit=10"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  holdings     Holding[]
  fireProfile  FireProfile?
  healthProfile HealthProfile?
  goals        Goal[]
  gamification Gamification?
  taxProfile   TaxProfile?
}

model Holding {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name           String
  assetClass     String   // MF | NPS | EPF | PPF | STOCK
  currentValue   Int      // paise
  investedValue  Int      // paise
  units          Float?
  nav            Float?
  notes          String?
  lastUpdated    DateTime @default(now())
  createdAt      DateTime @default(now())
}

model FireProfile {
  id                          String   @id @default(cuid())
  userId                      String   @unique
  user                        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  currentAge                  Int
  retirementAge               Int      @default(45)
  lifeExpectancy              Int      @default(90)
  currentMonthlyExpense       Int      // paise
  medicalMonthlyExpense       Int      // paise
  lifestyleBuffer             Float    @default(0)
  expectedReturnPre           Float    @default(12)
  expectedReturnPost          Float    @default(8)
  updatedAt                   DateTime @updatedAt
}

model HealthProfile {
  id                  String   @id @default(cuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  monthlyIncome       Int      // paise
  monthlyExpenses     Int
  monthlyEMIs         Int
  liquidAssets        Int
  totalLiabilities    Int
  monthlySavings      Int
  hasTermInsurance    Boolean  @default(false)
  hasHealthInsurance  Boolean  @default(false)
  hasWill             Boolean  @default(false)
  hasNominations      Boolean  @default(false)
  updatedAt           DateTime @updatedAt
}

model Goal {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name              String
  category          String   // FIRE | EDUCATION | WEDDING | PARENTS | HOUSING | OTHER
  targetAmount      Int      // paise
  targetYear        Int
  currentAllocation Int      // paise
  inflationRate     Float    @default(6)
  notes             String?
  createdAt         DateTime @default(now())
}

model Gamification {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badges          Json     // Badge[]
  streakDays      Int      @default(0)
  lastVisitDate   String
  dismissedNudges String[]
  updatedAt       DateTime @updatedAt
}

model TaxProfile {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  realizedGainsFY       Int      @default(0)  // paise
  unrealizedEquityGains Int      @default(0)
  updatedAt             DateTime @updatedAt
}
```

---

## API Routes

| Method | Path | Body / Response |
|--------|------|----------------|
| POST | `/auth/register` | `{email, password}` → `{accessToken, refreshToken, user}` |
| POST | `/auth/login` | `{email, password}` → `{accessToken, refreshToken, user}` |
| POST | `/auth/refresh` | `{refreshToken}` → `{accessToken}` |
| GET | `/holdings` | → `Holding[]` |
| POST | `/holdings` | `HoldingInput` → `Holding` |
| PATCH | `/holdings/:id` | `Partial<HoldingInput>` → `Holding` |
| DELETE | `/holdings/:id` | → `204` |
| GET | `/fire` | → `FireProfile \| null` |
| PUT | `/fire` | `FireProfileInput` → `FireProfile` |
| GET | `/health` | → `HealthProfile \| null` |
| PUT | `/health` | `HealthProfileInput` → `HealthProfile` |
| GET | `/goals` | → `Goal[]` |
| POST | `/goals` | `GoalInput` → `Goal` |
| PATCH | `/goals/:id` | `Partial<GoalInput>` → `Goal` |
| DELETE | `/goals/:id` | → `204` |
| GET | `/gamification` | → `Gamification` |
| PATCH | `/gamification` | `Partial<GamificationInput>` → `Gamification` |
| GET | `/tax` | → `TaxProfile \| null` |
| PUT | `/tax` | `TaxProfileInput` → `TaxProfile` |

---

## Key Logic

- All monetary values stored as integers (paise = ₹ × 100); frontend divides by 100 for display
- JWT: `ACCESS_SECRET` + `REFRESH_SECRET` from `.env`; access token 15min, refresh 7 days
- `auth.ts` middleware: extracts `userId` from JWT, attaches to `req.user`
- All route handlers are `async`; errors passed to `next(err)` → global error handler returns `{error: string}`
- CORS: allow `http://localhost:5173` in dev

---

## Scaffold Commands

```bash
mkdir server && cd server
npm init -y
npm install express prisma @prisma/client mysql2 bcryptjs jsonwebtoken zod cors helmet express-rate-limit dotenv
npm install -D typescript ts-node-dev @types/express @types/bcryptjs @types/jsonwebtoken @types/cors jest ts-jest supertest @types/supertest @types/jest
npx prisma init
# Set DATABASE_URL in .env to Hostinger MySQL connection string, then:
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

---

## Acceptance Criteria

- [ ] `POST /auth/register` creates user, returns tokens
- [ ] `POST /auth/login` validates password, returns tokens
- [ ] Protected routes return 401 without valid JWT
- [ ] All CRUD routes for holdings work end-to-end
- [ ] `prisma migrate dev` runs without errors
- [ ] Server starts on port 3001

---

## /be Prompt

> Build the backend scaffold per `specs/00-backend.md`. Stack: Node.js + Express + TypeScript + Prisma + MySQL (Hostinger). Store all money as paise (integer). JWT auth with 15m access + 7d refresh tokens.
