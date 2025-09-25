# Hypotheek Analyse: A Dutch Rent vs. Buy Calculator

This tool provides a detailed financial analysis to help users in the Netherlands compare the costs and benefits of buying a home versus continuing to rent. It moves beyond simple gross comparisons to provide a realistic, net-cost analysis over time, including key Dutch tax laws, upfront costs, and long-term wealth generation.

---

## For the User: What Does This Tool Help You Decide?

Making a decision about housing is one of the biggest financial choices you'll make. This tool aims to bring clarity by breaking down the numbers into a clear, step-by-step story.

### Core Question: Is it cheaper to rent or buy?

The answer is rarely simple. This tool helps you understand the trade-offs by analyzing three key stages of the journey:

1.  **The Starting Line: Can I afford the initial purchase?**
    *   Calculates all one-time costs you need to pay upfront.
    *   **Considers:**
        *   Your **Savings / Down Payment**.
        *   The **Overbid Amount**: The cash you need to pay above the property's official value.
        *   **Transfer Tax** (`Overdrachtsbelasting`): Includes the exemption for first-time buyers under 35.
        *   **Other Costs** (`Kosten Koper`): Notary, valuation, and advisory fees.

2.  **The Daily Race: How much will it cost me each month?**
    *   Compares the *net* monthly cost of owning a home versus your current rent. This is the amount you'll actually feel in your bank account.
    *   **Buying Costs Include:**
        *   Mortgage Payment (Principal & Interest).
        *   Estimated Monthly Maintenance.
        *   Property Tax (`Eigenwoningforfait - EWF`).
    *   **Buying Benefits Include:**
        *   **Mortgage Interest Deduction** (`Hypotheekrenteaftrek`): The tax refund you get on your mortgage interest, which lowers your net cost.
    *   **Renting Costs Include:**
        *   Your current monthly rent.
        *   A simplified **Rent Allowance** (`Huurtoeslag`) calculation, if you are eligible.

3.  **The Finish Line: What is the long-term financial outcome?**
    *   Projects your finances over the number of years you plan to live in the home.
    *   **The "True" Breakeven Point:** It calculates the exact year when the total financial benefit of owning (including the value of your home) surpasses the total cost of renting.
    *   **Wealth Generation:** It shows how much wealth (equity) you are building in your home each month and the potential cash profit you could make if you sell the property at the end of your planned stay.

---

## For the Developer: UI/UX & Component Structure

The application is built with **Next.js (App Router)**, **React**, **TypeScript**, **ShadCN UI**, and **Tailwind CSS**. The primary design goal is to guide the user through a complex financial analysis in an intuitive way.

### UI/UX Philosophy: "The Verdict-First, Chronological Journey"

The results display is structured to tell a financial story that is both immediately useful and easy to follow.

1.  **Verdict First (`VerdictCard`):** The most critical information is presented at the top. The user immediately gets the answer to "Which is better?" along with the three most important KPIs (monthly cost difference, breakeven year, and potential gain on sale). This caters to users who want the bottom line without delay.

2.  **Chronological Journey:** After the verdict, the results unfold in the order a user would experience them financially:
    *   **The Starting Line:** Focuses on the initial, one-time investment required to buy the house. It answers the user's first question: "What do I need to pay on day one?".
    *   **The Daily Race:** Details the recurring monthly costs. This section uses a stacked bar chart (`CostComparisonChart`) to visually compare the components of buying vs. renting.
    *   **The Finish Line:** Consolidates the long-term view, showing wealth accumulation over time. It features the projection chart (`ProjectionChart`) and a detailed explanation of the breakeven calculation, linking the visual to the underlying math.

This structure prevents information overload and builds the user's understanding step-by-step.

### Component Architecture

*   `src/app/page.tsx`: The main entry point.
*   `src/app/components/analysis-tool.tsx`: The main stateful client component that orchestrates the form and results. It uses `react-hook-form` for state management and `localStorage` to persist user inputs.
*   `src/app/components/input-form.tsx`: The left-column form with all user inputs, organized into accordions. It includes real-time validation via `zod`.
*   `src/app/components/results-display.tsx`: The right-column display area. It contains several sub-components (`VerdictCard`, `StatCard`, etc.) to implement the chronological journey UX. It is responsible for rendering the charts and all calculated KPIs.
*   `src/lib/schema.ts`: Defines the `zod` schema for all form inputs, providing a single source of truth for validation rules.
*   `src/lib/calculations.ts`: A pure function, `performCalculations`, that takes the validated form data and returns a comprehensive object with all calculated KPIs and projection data.

---

## For the Mathematician: Calculation Breakdown & KPIs

The financial model is implemented in `src/lib/calculations.ts`. Below are the key formulas and the reasoning behind them.

### Key Variables
*   `M`: Mortgage Amount
*   `P`: Property's Official Value (Mortgage Amount)
*   `O`: Overbid Amount
*   `S`: Savings
*   `r`: Monthly Interest Rate (`annualRate / 12`)
*   `n`: Total Number of Mortgage Payments (`30 * 12`)
*   `T_m`: Marginal Tax Rate

### Monthly Calculations

1.  **Gross Monthly Mortgage Payment**
    *   **Purpose:** Calculates the fixed monthly payment for an annuity mortgage (the most common type).
    *   **Formula:** `Payment = M * [ r * (1 + r)^n ] / [ (1 + r)^n - 1 ]`
    *   This is the standard formula for the present value of an annuity. The payment is split into an interest portion and a principal (equity) portion each month.

2.  **Monthly Tax Benefit (MID)**
    *   **Purpose:** Models the *Hypotheekrenteaftrek*. The interest portion of the mortgage payment is tax-deductible against your income.
    *   **Formula:** `Benefit = (M * r) * T_m`
    *   Note: This uses the interest of the *first month* as a simplification for the entire term. A more complex model would recalculate this as the interest portion decreases over time.

3.  **Monthly EWF Cost**
    *   **Purpose:** Models the *Eigenwoningforfait*. Homeowners must add a notional rental value to their taxable income. This formula calculates the tax cost of that addition.
    *   **Formula:** `EWF Cost = (P * 0.0035) / 12`
    *   `0.35%` is the standard EWF rate for properties up to ~€1.2M. The tax is calculated on the official property value (`WOZ-waarde`), which is assumed to be `P`, not `P + O`.

4.  **Net Monthly Buying Cost**
    *   **Purpose:** Calculates the actual cash impact on the user's bank account per month.
    *   **Formula:** `Net Cost = (Gross Mortgage) + (Maintenance) - (Tax Benefit) + (EWF Cost)`

5.  **Net Monthly Rental Cost**
    *   **Purpose:** Calculates the rental cost after potential government subsidies.
    *   **Formula:** `Net Rent = (Current Rent) - (Huurtoeslag Amount)`

### Upfront & Long-Term Calculations

1.  **Total Upfront Costs**
    *   **Purpose:** The total cash required on day one, which must be covered by savings.
    *   **Formula:** `Upfront = (Transfer Tax) + (Other Costs) + O`
    *   `Transfer Tax` is `P * 2%` (or 0% if `isFirstTimeBuyer`). `Other Costs` are typically a percentage of `P`. The `Overbid (O)` is a direct cash cost.

2.  **Cumulative Buying Cost (CBC)**
    *   **Purpose:** Tracks the total cash that has left the user's pocket over time.
    *   **Formula (for Year `y`):** `CBC_y = (Total Upfront Costs) + (Net Monthly Buying Cost * 12 * y)`

3.  **Realized Value on Sale**
    *   **Purpose:** Calculates the net cash a user would receive if they sold the house in a given year.
    *   **Formula:** `Value = (Accumulated Equity) - (Selling Costs)`
        *   `Accumulated Equity`: `(Property Value_y) - (Remaining Mortgage_y)`
        *   `Property Value_y` grows based on the `propertyAppreciationRate`.

4.  **Total Net Cost of Ownership (TNO)**
    *   **Purpose:** This is the *true* cost of owning the home over a period, accounting for the fact that the home is an asset you can liquidate.
    *   **Formula (for Year `y`):** `TNO_y = (CBC_y) - (Realized Value on Sale_y)`

5.  **True Financial Breakeven Point**
    *   **Purpose:** To find the year where owning becomes financially superior to renting.
    *   **Logic:** The breakeven year is the first year `y` where:
        *   `TNO_y < Cumulative Renting Cost_y`
    *   In other words, it's the point where the total *net* cost of ownership (after accounting for the asset you've built) becomes less than the total money "lost" to rent.
