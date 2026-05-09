# 🧠 AI Agent Prompt — FIRE Calculator (Functional Requirements Only)

Build an institutional-grade FIRE (Financial Independence, Retire Early) calculator for Indian users.

---

## 🎯 CORE FUNCTIONALITY

The system must:

1. Accept structured financial inputs across:

   - Personal profile (age, retirement age, life expectancy)
   - Expenses (categorized + inflation-adjusted)
   - Income (active + passive + growth rates)
   - Investments (asset-wise allocation, returns, contributions)
   - Real estate (value, rental, loans, appreciation)
   - Liabilities (loans, EMI, interest, tenure)
   - Insurance (life, health, emergency fund)
   - Financial goals (amount, year, inflation)
   - Retirement assumptions (withdrawal rate, post-retirement expenses)

---

## 🧮 CALCULATION ENGINE

Implement:

1. Inflation-adjusted expense projection

2. FIRE corpus calculation:

   - FIRE = annual expenses ÷ withdrawal rate

3. Portfolio growth simulation:

   - Annual compounding with contributions

4. Retirement simulation:

   - Withdraw yearly expenses
   - Apply post-retirement returns
   - Track corpus survival

5. Cashflow engine:

   - Income vs expenses vs investments

6. Goal funding logic:

   - Inflate goal cost
   - Deduct from portfolio at target year

---

## 📊 OUTPUTS (MANDATORY)

Generate:

- FIRE corpus required
- Years to financial independence
- Net worth projection (year-wise)
- Retirement corpus survival age
- Monthly/annual investment required
- Cashflow (surplus/deficit)

---

## 📉 ADVANCED LOGIC

Include:

- Scenario analysis (bull / base / bear returns)
- Inflation sensitivity
- Withdrawal rate sensitivity
- Sequence of returns risk (basic simulation)

---

## 🇮🇳 INDIA-SPECIFIC RULES

- Default inflation: 6%
- Medical inflation: 10%
- Withdrawal rate: 3–3.5%
- Include tax impact (basic capital gains)

---

## 🔁 SYSTEM BEHAVIOR

- Recalculate instantly on any input change
- Maintain year-by-year financial timeline
- Support multiple asset classes
- Support multiple goals
- Allow dynamic withdrawal modeling

---

## 🧩 DATA MODEL

- Modular inputs (grouped by category)
- Time-series simulation (year-wise loop)
- Separate accumulation and decumulation phases

---

## 🚀 EXPECTED OUTPUT

A complete financial simulation engine that:

- Tracks wealth accumulation
- Models retirement sustainability
- Handles real-world Indian financial complexity

---

## 🔚 CONSTRAINT

Do NOT build a basic calculator.
Build a **multi-variable financial simulation system**.
