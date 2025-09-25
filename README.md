# Dutch Mortgage Analyzer: Rent vs. Buy

This tool is designed to help you understand and compare the real costs of buying a home versus renting in the Netherlands. Making a decision about housing is one of the biggest financial choices you'll make, and this tool aims to bring clarity by breaking down the numbers in a simple, visual way.

## How It Works: An Evolving Analysis

This application is being built in stages to gradually add more detail and accuracy to the analysis.

### Stage 1: The Basic "Gross" Comparison

The first version of the tool started with a straightforward goal: to compare the *gross* monthly costs.

*   **What it did:** It compared your current monthly rent payment to the gross monthly mortgage payment (principal + interest) you would have if you bought a home.
*   **Purpose:** This gave a quick, initial look at the cash outflow difference between renting and buying, without considering any tax effects. It answered the simple question: "How much will I pay out of pocket each month?"

### Stage 2: The Realistic "Net" Picture & Equity

The second version makes the analysis much more realistic by incorporating key Dutch tax rules and introducing the concept of building wealth through your home.

*   **What it does now:** It calculates the *net* monthly cost of buying, which is what you *actually* feel in your bank account after taxes.
*   **Key Features Added:**
    *   **Mortgage Interest Deduction (Hypotheekrenteaftrek):** This is a major tax benefit for homeowners. The tool now calculates the tax refund you get on the interest part of your mortgage payment, reducing your effective monthly cost.
    *   **Notional Rental Value (Eigenwoningforfait - EWF):** This is a tax you pay for the "income" you get from living in your own home. The tool adds this to your costs for a more accurate picture.
    *   **Equity Accumulation:** When you pay your mortgage, part of the payment reduces your loan. This part is not an expense; it's you paying yourself. The tool now shows you exactly how much wealth (equity) you are building in your home each month.
    *   **Smarter Upfront Costs:** It now accounts for the transfer tax exemption for first-time buyers under 35, which can save you thousands in one-time costs.

With these changes, the tool provides a far more accurate and complete financial picture, helping you see not just the costs, but also the investment potential of buying a home.

---
This is a Next.js starter project created in Firebase Studio. To get started with development, take a look at `src/app/page.tsx`.