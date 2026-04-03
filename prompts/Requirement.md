# **Comprehensive Technical and Behavioral Framework for Indian Retirement Planning: A Phased Architecture for Desi FIRE Software Solutions**

The landscape of personal finance in India is undergoing a profound structural transformation, driven by an "equity-ising" shift in household savings and a burgeoning desire among young professionals for financial autonomy.1 As of 2026, the traditional retirement paradigm—characterized by a fixed exit at age 60 supported by debt-heavy instruments—is increasingly viewed as obsolete by millennials and Gen Z cohorts who prioritize "work-optional" lifestyles through the Financial Independence, Retire Early (FIRE) movement.1 However, the architectural realization of a comprehensive retirement solution in the Indian context faces significant complexities, including structurally high inflation, volatile market returns, and a fragmented regulatory environment involving multiple asset classes such as the Employees' Provident Fund (EPF), Public Provident Fund (PPF), and the National Pension System (NPS).5 To address these challenges, this report provides an exhaustive blueprint for developing a sophisticated, gamified retirement planning software, structured as a phased Product Requirements Document (PRD) optimized for iterative implementation via large language models (LLMs).

## **Foundations of the Desi FIRE Economic Model**

Building a robust retirement solution begins with a mathematical engine that transcends basic calculators. The "Desi FIRE" movement requires a departure from Western-centric rules of thumb, specifically the widely cited "4% rule," which often fails to account for the unique volatility drag and inflation shocks prevalent in emerging markets.5 Research specifically adapted to the Indian economy suggests that a more prudent safe withdrawal rate (SWR) lies between 3.0% and 3.5%, implying that a sustainable retirement corpus should range from 30 to 35 times annual inflation-adjusted expenses.11

### **The Twin Killers of 2026: Healthcare Inflation and Longevity**

Any high-fidelity logic engine must neutralize the "Wealth Killers" that undermine long-term financial stability in India.3 While general headline inflation is typically modeled at 6%, urban lifestyle costs often rise at 8%, and medical inflation is estimated at a staggering 11-14% annually.3 Furthermore, advancements in healthcare are extending life expectancies into the late 80s or early 90s, meaning a professional retiring at 40 must engineer a self-sustaining financial ecosystem that lasts 50 years—longer than their entire working career.3

| Expense Category | Projected Annual Inflation Rate | Impact on 15-Year Planning Horizon |
| :---- | :---- | :---- |
| General CPI | 5% \- 6% | Core purchasing power halves in \~12 years 5 |
| Urban Lifestyle | 7% \- 8% | Discretionary spending needs triple in \~15 years 3 |
| Tertiary Healthcare | 11% \- 14% | Medical costs increase 5.5x in \~15 years 3 |

The software's logic engine must therefore apply differential inflation rates to various expense buckets. A procedure costing ₹5 lakh today will realistically cost ₹18.5 lakh to ₹27 lakh in 10-15 years, necessitating a dedicated healthcare reserve—often recommended at ₹50-75 lakh—independent of the core living corpus.5

### **Mathematical Formulas for High-Fidelity Projections**

To maintain factual integrity and avoid hallucination during the code generation process, the LLM must be directed to use deterministic algorithmic solvers for all core calculations.19 The primary projection formula for future expenses is the Future Value (FV) equation:

![][image1]  
where ![][image2] represents the future value of annual expenses at retirement, ![][image3] is the current annual expense, ![][image4] is the inflation rate, and ![][image5] is the number of years until retirement.16 The required retirement corpus (![][image6]) is then calculated using the real-return annuity method:

![][image7]  
where ![][image8] is the first-year retirement expense, ![][image9] is the real rate of return (post-retirement return minus post-retirement inflation), and ![][image10] is the number of years in retirement.24

## **Technical Architecture and Data Integration Layer**

A central challenge in Indian retirement planning is the fragmentation of assets across diverse regulatory bodies. A sophisticated solution must aggregate data from SEBI-regulated mutual funds and stocks, PFRDA-governed NPS accounts, and EPFO-managed provident funds.7

### **Integrating the Account Aggregator Framework**

The software architecture should prioritize the integration of India's Account Aggregator (AA) framework, which enables secure, consent-based digital sharing of financial information across institutions.28 This framework provides a 360-degree view of the user's financial life, allowing for the automated categorization of transactions and real-time updates to the retirement plan.28

| Asset Type | Data Ingestion Method | Tracking Parameters |
| :---- | :---- | :---- |
| Mutual Funds | CAS (Consolidated Account Statement) Import / MFapi.in 30 | Units, ISIN, NAV, Folio Number, Transaction History 33 |
| NPS | NPSNAV.in API / CRA Integration 37 | Tier I/II balance, Asset mix (E, C, G), PFM selection 25 |
| EPF / PPF | EPFO Passbook Scraping / Manual Entry with Declared Rate 32 | UAN, Monthly contribution, Government-notified interest rates 8 |
| Direct Equity | NSE/BSE REST API / Broker API 41 | LTP (Last Traded Price), Average Cost, Dividends, Buyback tax status 43 |

### **Handling Regulatory and Tax Nuances**

The software must be context-aware of the significant regulatory changes effective from April 1, 2026, under the Income Tax Act, 2025\.44 This includes the modernization of tax calculations using the unified "Tax Year" concept and the implementation of higher Securities Transaction Tax (STT) rates on derivatives, which affects active traders within the retirement accumulation phase.45

* **Long-Term Capital Gains (LTCG):** Calculations must factor in the 12.5% tax on gains exceeding ₹1.25 lakh, encouraging tax-harvesting strategies to "book" tax-free profits annually.3  
* **NPS Flexibility:** The system must reflect updated PFRDA rules allowing 100% equity exposure and the reduction of mandatory annuity purchase to 20% for certain corpus thresholds.26  
* **Provident Fund Limits:** Logic must monitor the ₹2.5 lakh annual contribution threshold, above which interest becomes taxable, and the combined ₹7.5 lakh employer contribution limit across PF, NPS, and superannuation.7

## **The Financial Health Score Engine**

To fulfill the requirement for a "Desi FIRE Health Calculator," the system must compute a holistic wellness score based on 15 parameters analyzed across six key pillars: Risk Management, Budgeting/Taxation, Loan Management, Goal Planning, Investment Strategy, and Estate Planning.56

### **Quantitative Health Ratios**

The core of the health engine relies on standard financial ratios tailored to the Indian middle class's behavioral patterns and obligations.58

| Metric | Calculation / Ratio | Goal / Healthy Range |
| :---- | :---- | :---- |
| **Basic Liquidity Ratio** | Liquid Assets / Monthly Living Expenses | 3 \- 6 months coverage (ideally 12 for job loss) 57 |
| **Reserve Surplus Ratio** | Monthly Surplus / Net Monthly Income | \>25% (indicates flexibility for goals) 59 |
| **Saving to Surplus Ratio** | Monthly Investments / Monthly Surplus | \>75% (measures wealth-building efficiency) 59 |
| **Debt Service Ratio** | Total EMIs / Gross Family Income | \<35% (Ideal); \>40% indicates stress 57 |
| **Solvency Ratio** | (Total Assets \- Total Liabilities) / Total Assets | \>20% (demonstrates long-term security) 58 |

### **Qualitative Wellness Parameters**

Beyond pure numerical ratios, the health score should incorporate critical checkboxes for financial hygiene:

1. **Emergency Buffer:** Presence of a 12-month essential expense fund in liquid instruments.3  
2. **Insurance Optimization:** 15x annual income term life cover and a comprehensive family floater health policy with a ₹1 crore super top-up.3  
3. **Estate Readiness:** Evidence of updated nominations across all bank/mutual fund accounts and the existence of a legally valid will.57  
4. **Tax Hygiene:** Spreading tax-saving investments across the year rather than a last-minute March 31st rush.57

## **Behavioral Fintech and Gamification Architecture**

Retirement planning suffers from "context rot" and user fatigue because of its abstract, long-term nature. To maintain motivation, the software must transform financial discipline into a series of interactive, rewarding experiences.69

### **The Psychological Toolkit for Financial Behavior Change**

Effective gamification in fintech leverages behavioral science principles to counteract present bias and inertia.71 The architecture should integrate the following mechanics:

* **Loss Aversion and Streaks:** Utilizing "streaks" for daily login or recurring monthly investments. The "fear of losing" an unbroken chain of disciplined actions is often more motivating than the actual reward.70  
* **Goal Framing and Progress Bars:** Breaking down the massive "₹10 Crore FIRE goal" into microscopic, achievable levels. Visual progress bars that change color (green for on-track, red for caution) create a psychological "scoreboard" effect.70  
* **Variable Reward Schedules:** Implementing random rewards such as "Mystery Boxes" or digital collectibles for completing non-pleasurable tasks like updating a will or reviewing a tax statement.70  
* **Social Relatedness:** Opt-in anonymous leaderboards or "social saving" circles where users compare their Savings Ratio against peers in similar age and income cohorts.70

### **Case Studies in Indian Gamification: CRED, Jar, and Gullak**

The proposed system should emulate the successful "Choice Architecture" found in top-tier Indian fintech applications:

* **Jar:** Taps into the dopamine-driven loop of "spare change" investing via UPI AutoPay, turning every spend into a small investment win without a perceived lifestyle "pinch".71  
* **Gullak:** Uses "Mental Accounting" by allowing users to name their digital piggy banks (e.g., "Munnibai's Higher Education" or "Coimbatore Beach Home"), creating emotional tagging that prevents the mixing of funds.71  
* **CRED:** Focuses on "Exclusivity and Status," targeting top-tier creditworthy users with premium rewards, transforming a soulless utility into an aspirational brand.77

## **Product Requirements Document (PRD) Phase-by-Phase Roadmap**

To prevent context dilution and ensure a sophisticated, modular build using an LLM, the development process must be broken into five discrete implementation phases.82

### **Phase 1: The Secure Ledger and Multi-Asset Engine**

This phase builds the foundational infrastructure for tracking a heterogeneous portfolio.

* **User Persona:** The "Accumulator"—a professional juggling multiple accounts and needing a single source of truth.42  
* **Functional Requirements:**  
  * Secure multi-factor authentication (MFA) and data encryption using AES-256.87  
  * Database schema supporting 3-Normal Form (3NF) for transactions in Mutual Funds, NPS, EPF, PPF, and Stocks.90  
  * Manual entry interface for current balances with automatic date-stamping.30  
* **User Story:** "As an Indian professional, I want to list all my government and market investments in one place so I can see my total net worth across different regulators".42

### **Phase 2: The "Desi FIRE" Logic and Projection Engine**

This phase adds intelligence to the ledger, transforming static data into future-focused projections.

* **Functional Requirements:**  
  * Input handling for age, retirement age, life expectancy (90+), and detailed expenses (groceries, transport, housing).16  
  * Dynamic inflation configuration: 6% General, 12% Medical, and a manual "Lifestyle Upgrade" buffer.5  
  * Implementation of the "Rule of 33x" calculation for a 3% SWR, accounting for the tax drag of the 12.5% LTCG regime.3  
* **User Story:** "As a FIRE aspirant, I want to calculate my target corpus using conservative Indian-specific withdrawal rates so I don't outlive my savings".6

### **Phase 3: The Financial Wellness Diagnostic and Health Score**

Integration of high-level coaching through dynamic scoring and ratio analysis.

* **Functional Requirements:**  
  * Logic for the 15 financial ratios (Liquidity, DTI, Solvency, etc.) with real-time score updates as data changes.56  
  * Categorization of users as "Financially Healthy," "Coping," or "Vulnerable" based on score thresholds.28  
  * Automated suggestion engine: "Your DTI is \>40%; consider paying off high-interest personal loans before increasing SIPs".56  
* **User Story:** "As a user, I want a monthly health checkup report that identifies my financial weak points so I can take corrective action before retirement".56

### **Phase 4: Gamification and Behavioral Nudges**

Transforming the PRD from a tool into a habit-forming platform.

* **Functional Requirements:**  
  * Progress bars for the FIRE goal and smaller sub-goals like "Home Loan Prepayment".70  
  * Achievement badge system (e.g., "Triple Threat": Having EPF, NPS, and PPF accounts active).70  
  * "Learn & Earn" educational modules: Gamified quizzes on 2026 tax rules that unlock premium app features or design skins.71  
* **User Story:** "As a young saver, I want to receive instant gratification for my boring financial tasks so I stay committed to a 20-year plan".70

### **Phase 5: Automation, Sync, and Tax Strategy Optimization**

Moving toward a "Financial Operating System" with minimal manual intervention.

* **Functional Requirements:**  
  * API integration for daily NAV updates from AMFI and NPSNAV.in.37  
  * Automatic tax-harvesting alerts when equity gains approach the ₹1.25 lakh limit.3  
  * Three-bucket allocation automation: Moving funds from Bucket 3 to Bucket 1 as the retirement date nears ("The Glide-Down").3  
* **User Story:** "As a sophisticated investor, I want my dashboard to automatically optimize my portfolio for the 2026 tax regime so I maximize my post-tax retirement income".3

## **LLM Implementation Strategy: Phased Prompting for Robust Build**

To construct this sophisticated solution using an LLM while avoiding context dilution and hallucination, a structured, incremental approach is essential.83 The user should treat the LLM as a Senior Architect and Product Partner, feeding it prompts phase-by-phase.

### **The System Prompt Template**

Every interaction should begin by anchoring the model in its specialized role and the project's permanent invariants.

"You are an expert Senior Fintech Architect specializing in the Indian financial ecosystem. Your task is to help me build a sophisticated retirement planning platform for the 'Desi FIRE' market.

**Permanent Project Invariants:**

1. All logic must adhere to the Income Tax Act 2025/2026 and historical Indian inflation trends (6% General, 12% Medical).  
2. Primary mathematical formulas must be deterministic and verified through test cases.  
3. Data privacy is non-negotiable; no PII or sensitive account details in plain text.  
4. Use Markdown for PRD updates and TypeScript for technical specifications. **Operational Rule:** We will work in distinct modules. Do not move to the next phase until the current one is approved and test-covered." 83

### **Context Management and the CLAUDE.md Strategy**

To prevent "Context Rot"—where the model loses sight of earlier requirements as the conversation lengthens—the user must maintain a single "State Document" (e.g., CLAUDE.md) that is updated at the end of every phase.83 This document must be prepended to every prompt and should include:

* **Approved High-Level Architecture:** (e.g., PostgreSQL for data, React for frontend, FastAPI for computation).90  
* **Global Logic Variables:** (e.g., SWR \= 3.5%, Default Retirement Age \= 45, Life Expectancy \= 95).3  
* **Security Policy:** (e.g., "MFA mandatory for all account syncing events").87

### **Avoiding Hallucination through TDD and Self-Assessment**

LLMs often fail by ignoring implicit constraints (e.g., a bank balance cannot be negative).19 To mitigate this, the implementation prompt should use the "Propose-then-Execute" and "Validation Agent" patterns.83

1. **Test Scenario Generation:** "Before writing the code for the Health Score module, generate 10 unit test cases that cover edge cases: a user with ₹1 Crore debt, a user with zero income, and a user whose savings rate is \>70%".83  
2. **Self-Correction Loop:** "Review your previous code generation for the NPS calculator. Did you account for the 10% employer contribution limit in the Old Regime versus the 14% limit in the 2026 New Regime? If not, correct the logic now".19  
3. **Intermediate Verification:** Force the model to check its work at multiple steps to ensure the plan is described correctly to the underlying solver before the final output is provided to the user.19

## **Nuanced Considerations for the Indian FIRE User**

A truly comprehensive solution must look beyond simple numbers to address the cultural and social realities of the Indian professional.

### **Family-Centric Financial Obligations**

Unlike the Western FIRE model which focuses heavily on individual autonomy, the "Desi" model often involves interdependence.124 Projections must include "Milestone Buffers" for:

* **Joint Family Support:** Ongoing care for aging parents, which may not be covered by insurance.50  
* **Traditional Life Events:** Significant buffers for sibling or children's weddings and higher education costs, which often suffer from education-specific inflation higher than the CPI.40  
* **Housing Stability:** Factoring in the high cost of real estate in Tier 1 cities, where owning a primary residence is often a non-negotiable precursor to early retirement.50

### **Sequence of Returns Risk and Stress Testing**

The logic engine should include a "Panic Mode" simulator that stress-tests the retirement plan against "Triple Red" scenarios: a simultaneous decline in domestic equities, bonds, and the currency.129

| Stress Scenario | Mathematical Impact | Corrective Behavioral Nudge |
| :---- | :---- | :---- |
| **Early Market Crash** | 30% equity drop in first 3 years of retirement 3 | Trigger: "Reduce discretionary spending by 20% for 12 months to preserve corpus" 9 |
| **Medical Emergency** | Sudden ₹25 Lakh out-of-pocket hospital expense 3 | Trigger: "Utilize medical top-up insurance; replenish health buffer over next 24 months" 3 |
| **High Inflation Spike** | General inflation stays at 10% for 2 consecutive years 3 | Trigger: "Rebalance portfolio to increase Bucket 3 (Growth) allocation by 10%" 3 |

## **Conclusion: Reclaiming Time through Sophisticated Engineering**

Building a comprehensive retirement solution for the Indian professional is an exercise in balancing high-stakes mathematical rigor with nuanced behavioral psychology. By adopting a phased, context-aware development roadmap and leveraging the 2026 regulatory landscape, developers can move beyond static planning toward a dynamic "financial operating system."

The success of such a system lies in its ability to humanize the process—turning the "sacrifice" of saving into a gamified quest for time-freedom. Through the integration of the Indian Account Aggregator framework, high-fidelity health scoring, and dopamine-driven engagement loops, the software becomes more than just a tracker; it becomes a motivational companion. Guided by a robust LLM build strategy that prioritizes TDD and modular context maintenance, this architecture ensures that Indian professionals can transition from active employment to a "work-optional" life with measurable confidence and structural resilience.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAuCAYAAACVmkVrAAAEzElEQVR4Xu3dS6htcxwH8L888irPSCmPRKKQPPKYmRhgQEkMzCiZeHS9BjcyYCDpUtcjGYiBmURIJzOPQnkUKSSKTISJxP/bWqvzv+ucvc/e7jl7n9v9fOpXe/3X3p111rm1v/3+//+6pQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwIGfUumA8uGRv1jp/PAgAbD8/1Pqj1r+1fumP27HXal3Xj+U49W2tK/Ph6pBaTzXn7uvHt9LTZfV6/ulft9d8Zq2Daj3Tn8/YT7XeyYd7p/bjqW9qXdKc22yv13pyPFgdVuuNWkeMTyzQ7bVObo4fLN39e7bWwbVerbWjOQ8ALMEBtV4sXTBLyGllrP2y/rN0AWfsyFo3jge32PGlu5abR+MJH+015vpzfFIzNvi4dMFtKx1Xa1fp7vPg6lq31bqz1krp7t88do8H9tKvtc5pjh+tdWj/OkH4wuYcALAEx9T6qHQBYuylsmcg+r6sH9jSpUk3ZpEuqvVbrbNH4zlur/Ga/nj8vnS3bhmNbYVra10xHuzl2lbK/IEtf5fNlPu4s3+doJau3+CtWkfVOrAZAwAWLIEsgSYdq0iX7ar+dULRsf3rWClrA1u6c/ePxrba0BXMVGwr1/58rQ+bsXSH0hlMOGqluzarBNqx62t9Nh4cyT39oqztXA4WEdhuKt10b+7Z3WXtPYuMJbRF/vZf969z3S/Uerw/BgCWJMEnIWwIFZeXPdc0tRIU8t5huizeL9203yINQWg8HZoQlTVr7UL6TIWmM9h2EPO7PtIcbyTTvaeMxhLWxmNj59X6fTzY2OrAlpD2WOnuyUO17qh1b61z2zeV7t4MQTydtMObc+nA6q4BwJKl+/R3rRv6ypf7JHeVPdeDpbM2qXs0li/9fG6jasPgJEPA+LGsbjj4tHSL5du1YpEF/e+W1ZCT6b23V0/PLKEtIW2WztpgmI6dZKsDW6Zjcz9yDTtrXVq6v/cJzXsiU7b5NwAAbFP5Ms+uz8G0MDMEkHSO4oPm3CINXcFxOJskASehLeEt04KZ5ptXftattb4s3SM6ZrG3gS0/87KyGqaHSldzPLbeTtN0ABOAE8YmraOLYdoYANiGhp2W7XRhpsAmycL9rHVK0MiC/UlBYz2b2WH7q8wXMPL7ZVo0ASaB7f/YFztskTVpL5fp4VaHDQC2sWwq2Kj70kqgSvB5rsy3aD/y3LZh+nJaPTx8YIqEoKxhm1WCUQLeE6WbEp1Xwk67Zi2hbXg9TR7fsezA9kBZfwdwa6NgCQAsQQJINhbkga7vle5ZZLOEhqxXy7PZPi9r10EtQh4dkpCZcJFNA7Ncc5xeus+s9/DaWWz2LtF0ERN+76n1Sa2zSrdxY1oXrDVPYPuurO4AniS7RH8eDwIAyzV0VNra2b5hijw2I4vZlyE/u73mHM/ixFpflcm7X6c5ukz+XDpo0ySovVLWBqb17v9KmT2AzhPY0lncKAiulO55awAA+6WExV1l49A0j93jgb2U3banjQcBAPYnCUSz7ixdtEzFZnp5MwMlAMA+JxsUNlrvtgwXl9X/1QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIB90H/9DuC4nx1QRAAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAZCAYAAADJ9/UkAAABkUlEQVR4Xu2UvytGURjHv4pCJBFJymqQJINCSYrBZmOwGQ0mP/4EAwZKJMqvgbJSEoPB4h8wMNgkQkni+/Sc877nHve+996Fwf3Up7d7nvOc5z3PuecCGf+dIbqawEXarCnY9mLLtM7EhFa6582pceI5ZOIIPaJfdNw8W/fpJ32lHZoSmP9I+2mJiQm1dBKa80TnaLETD1BNr6CLhSFFT6DzLN30gz44Yxb5I+t0yg+E0QJd5NkPGKT4Di11xtqg89+cMcsAPaZVfiCMUeiuZfcWaZ20Vuij805MaKC3CO/WKe3xB6NYgi6y5owN0l3n2aeSXuBn8SK6YH5jsS2XRe7pHX2BnqecayE2ESxehny3EuG23L5QnfSaNtpJEcxAcyvM8xhSFpdWywIbyLdKdryFAtfDMAHNlfejiV7S9sCMArhXTDpgkR3L/Y9jGJorhVfoNBKetWCvi/sBSYPkSO4sPUfEVyyKA+g/P6TlXiwJ9fQGuuu4I8rRRd+hhX3TIC/aGfLf/F+n1x/IyMj4c74BIppZ+6DEVAsAAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAZCAYAAADJ9/UkAAABjklEQVR4Xu2UPSiGURTH/4pB+RiIDEo2gyTZsMggMchosBkNJh+r3SDKx2BQBovFIEkMisViNJCPUhLFQOJ/nHu99znv+/A8C4PnV7/e9z3n3Hvue+99HiDjv9NLF+kKPXHKd4mJY7Tqq1pZcznvPK0J8s103dTYOT5pokPQCd/piPvtfaFPtM/VCxLfhNbf025aEuSroYuWcQ90mhYH+QhldA86maUNOonkZJc8HfSV3gUxjyxEdm/cJgrRSG/oo02QQWhjaSQNPS3Q+ucg5umh27TSJgoxAG1wbBNkDpo7QvTc6ui5y1l2aacNxjEDnWTZJsg19Nz7TbycHiC/eRGddZ8/4rdcJrmlF/SSvtErWpErzWMV0eal0IuYGL/lp9BbmoZJ6Fi5sMIwUjb3W76Bbx6HGEahY2XR9fSQtkYqviF8xGSitMg9kLHSeIFOIOFZC/685XFpN7kk+HfAFN1HzFssjiXoyreQO7c01NIz6L9OfGT+BSGNQ3fCogT4Y2uIhn+PLhvIyMj4cz4AEdtbPUv60UAAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAaCAYAAABl03YlAAAAiUlEQVR4XmNgGAWkAgECfIYgIH4OxKuBWB+IDwHxCSAuBmJGkAJ+IF4DxOVA/B+IXwOxFRBbA/EBIOYBKXIB4llAPAmqKAMkCAS9QLwciFlAHE8gtgPiwwwQK5WgiviAmBvKhgOQKa3ogugApAhkKk4AchyyVVgBSHIrEHOgSyADBwZIEIwCCgAAxm8UgTb9h3UAAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAYCAYAAADOMhxqAAAAtklEQVR4XmNgGAWDDYgBMTMSXwCLGBjwA/EWIPYF4v9AfAaIl0HlhIH4HBBfhfLBwAWIlwNxOgNEwx4GiCEgwAPEB4D4IZQPBp5QvAaI/wGxB5KcEhA/Z0CzAQZ+A/FWIOaA8lkYIDajGwIHIOeUI/EVgfgJEF8HYnEgjgFidpgkyDSQDTYwAQaEn1qh/MlAzAiTNAbi+cgCQKAPxK+BeD8QX0QSBwNQWLOiCzJA/CMJpUcB7QAAc/QdgqUT/vMAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAaCAYAAABozQZiAAABA0lEQVR4Xu3SMUuCURTG8SPqEAkSQtQQ6CLYUEJEEPQVgginPoCLu6vg19DBPYKGnKXagqaGIFsiWhyCwMGl+t/uVc57Mm5z+cAPeZ/zXricV5E/mwLWkVNdFsvqOZEU9nCBD7xggksU0cHJ9GWdNZzhHedIh979HuEWb9gO/SxVPGGMQ/E30HHPbdxgxcxkhFfs24HKrvhrJ9LEHVbtwMQtr6KLEp7R0OUPcYeXdFEXv9UdXf42PfGHvy0hFvfxB+IP2+1Gk8Gp+MOxuJ205pXucGIRJkX0sWH6r+IBB3YQkhf/Vz22g2nc4BFbpt/EFWoS2clQ/PXv0Q2uUdYvLfK/8gk/KihVrGe+kAAAAABJRU5ErkJggg==>

[image7]: <data:image/png;base64,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>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAbCAYAAACjkdXHAAAA9ElEQVR4Xu2RPw4BQRSHn0QpESEOoCNEoZI4AIVOonAAF5C4BxWRKEkUopE4A6VSo9FpJAqF8PvlzdgxZDnAfsmXnX1/dt7MikQ04PhPWftGCbbgCj7g0bxbO3Bkcn3T88FAtGDqJwwn2PSDJAW3os1dL2dZw5ofJHl4hldYceIFmDHrJSw7uRc8F3fl7pyCJOBC9MNkDrNm/cIdeSd6q3vzznsIxY58gz3RGx7Cu+hEoXwbOQ03EoxMeIwPJqLNfFpycCZBQxzWg3SAPW/YiEWY9IPkYvz6G0R3dad6wz+vSwy24cENVkVvl42/ZB3rIyL+4wm53T9I1ue+FgAAAABJRU5ErkJggg==>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAaCAYAAAB7GkaWAAAAmUlEQVR4XmNgGBxAEIgZ0QVBgBWI/wOxJ7oECAgD8XMg1kSXgAEOdAEQYGaA6MQAKkB8GohfA7E8sgQPEK8AYjMgNgXiImRJFyDuZ4A4Px2II5AlQc4G6eAE4h1ArIgsCQMNQPwPXRAE+IH4BBBfB2JlIA5ElrQB4t9APAmISxnQ7PVlgAQbiF7OgOZfGQaIkfuB2ARZYiQAAFZgE43tkM6uAAAAAElFTkSuQmCC>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAZCAYAAAA8CX6UAAABD0lEQVR4Xu2SsUoDQRRFrxALixAEwcIqZQqjYKXgB9hYBItA/iJfkG9IUkiaQJo0doqIgrWdZfqQ1g9IEfRe3gzOzG42JKTcAweWeW/vzJtdoGRb7ugXnTubcRm39ImOAi+jDsc5faCP9JdOaSWon9EO/aQrOqAnQT3imL7SG1hYL6oCB3QMCyykAQtSoIJm9DSo+43UV4h26rvnBSys/V/GFf2ABRaiEH/sISzojR65tXCjtYRjCb2sEIUpdKexPBpLQRpTY73QatSRQziWRxetC1dY3kYZdOx3epEWYL+Agp5pKy5lSe8npA4b7Qcb7ueQftMJrSU1zzU2jKWGJezo3m7UYegL3qeLJSX75A/RdzUL5u12HAAAAABJRU5ErkJggg==>