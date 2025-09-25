import type { AnalysisFormValues } from './schema';

export type CalculationInput = AnalysisFormValues;

export type YearlyProjection = {
    year: number;
    cumulativeBuyingCost: number;
    cumulativeRentingCost: number;
    accumulatedEquity: number;
    propertyValue: number;
};

export type CalculationOutput = {
    // Gross calculations
    grossMonthlyMortgage: number;
    monthlyInterest: number;
    monthlyPrincipal: number;

    // Costs
    estimatedSalePrice: number;
    totalUpfrontCosts: number;
    monthlyMaintenance: number;
    
    // Net calculations
    monthlyTaxBenefit: number;
    monthlyEwfCost: number;
    totalNetMonthlyBuyingCost: number;

    // Comparison
    monthlyCostDifferential: number;
    currentRentalExpenses: number;
    netMonthlyRentalCost: number;
    huurtoeslagAmount: number;

    // Equity
    monthlyEquityAccumulation: number;

    // Stage 3: Long-term projection
    projection: YearlyProjection[];
    breakevenPoint: number | null;
};

// Statutory rates
const EWF_RATE = 0.0035; // 0.35%

// Simplified Huurtoeslag (Rent Allowance) Calculation
// These are illustrative values and do not reflect official 2024 limits.
function calculateHuurtoeslag(income: number, rent: number, household: 'single' | 'couple'): number {
    const incomeLimit = household === 'single' ? 30000 : 38000;
    const rentLimit = 808; // Example limit

    if (income > incomeLimit || rent > rentLimit) {
        return 0;
    }

    // Simplified formula: subsidy decreases as income approaches the limit.
    const incomeRatio = 1 - (income / incomeLimit);
    const potentialSubsidy = (rent - 250) * 0.75; // Assume a base contribution
    
    const calculatedSubsidy = Math.max(0, potentialSubsidy * incomeRatio);
    
    return Math.min(calculatedSubsidy, 350); // Cap the subsidy
}


export function performCalculations(data: CalculationInput): CalculationOutput {
    // P1.0: Gross Monthly Mortgage (P&I) and Interest/Principal split
    const M = data.maxMortgage;
    const annualRate = data.interestRate / 100;
    const monthlyRate = annualRate / 12;
    const n = 30 * 12; // 30 years

    const grossMonthlyMortgage = M > 0 && monthlyRate > 0
        ? M * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
        : (M > 0 ? M / n : 0);

    const monthlyInterest = M * monthlyRate;
    const monthlyPrincipal = grossMonthlyMortgage - monthlyInterest;

    // Estimated Sale Price (Purchase Price)
    const P = data.maxMortgage + data.savings;

    // L1.0 & P2.0: Monthly Tax Benefit (MID)
    const monthlyTaxBenefit = data.midEligible && monthlyInterest > 0
      ? monthlyInterest * (data.marginalTaxRate / 100)
      : 0;
      
    // P3.0: Monthly Eigenwoningforfait Cost (EWF)
    const monthlyEwfCost = (P * EWF_RATE) / 12;

    // P4.0: Total Upfront Costs (Revised)
    const isTransferTaxWaived = data.isFirstTimeBuyer && data.age < 35;
    
    const transferTaxCost = isTransferTaxWaived 
      ? 0 
      : P * (data.propertyTransferTaxPercentage / 100);
      
    const otherCosts = P * (data.otherUpfrontCostsPercentage / 100);
    
    const totalUpfrontCosts = transferTaxCost + otherCosts;

    // Estimated Monthly Maintenance
    const monthlyMaintenance = (P * (data.maintenancePercentage / 100)) / 12;
    
    // P5.0: Total Net Buying Housing Cost
    const totalGrossMonthlyBuyingCost = grossMonthlyMortgage + monthlyMaintenance;
    const totalNetMonthlyBuyingCost = totalGrossMonthlyBuyingCost - monthlyTaxBenefit + monthlyEwfCost;

    // P6.0: Monthly Equity Accumulation
    const monthlyEquityAccumulation = monthlyPrincipal;

    // C1.0 & C2.0: Huurtoeslag & Net Rental Cost
    const huurtoeslagAmount = data.isEligibleForHuurtoeslag
      ? calculateHuurtoeslag(data.annualIncome || 0, data.currentRentalExpenses || 0, data.householdSize)
      : 0;
    const netMonthlyRentalCost = data.currentRentalExpenses - huurtoeslagAmount;

    // Comparison Calculation (using Net cost)
    const monthlyCostDifferential = totalNetMonthlyBuyingCost - data.currentRentalExpenses;


    // C3.0 - C6.0: Long-Term Projection
    const projection: YearlyProjection[] = [];
    let cumulativeBuyingCost = totalUpfrontCosts;
    let cumulativeRentingCost = 0;
    let accumulatedEquity = 0;
    let breakevenPoint: number | null = null;
    let remainingMortgage = M;
    let currentPropertyValue = P;

    const annualNetBuyingCost = totalNetMonthlyBuyingCost * 12;
    const annualNetRentingCost = netMonthlyRentalCost * 12;

    for (let year = 1; year <= data.intendedLengthOfStay; year++) {
        // C4.0: Cumulative Cost Tracking
        cumulativeBuyingCost += annualNetBuyingCost;
        cumulativeRentingCost += annualNetRentingCost;

        // C5.0: Equity Calculation with Appreciation
        // This is a simplified calculation. A real one would track interest/principal per year.
        const annualPrincipalPaid = monthlyPrincipal * 12; // Simplified
        remainingMortgage -= annualPrincipalPaid;
        
        currentPropertyValue *= (1 + data.propertyAppreciationRate / 100);

        accumulatedEquity = currentPropertyValue - remainingMortgage;
        
        projection.push({
            year,
            cumulativeBuyingCost,
            cumulativeRentingCost,
            accumulatedEquity: Math.max(0, accumulatedEquity), // Equity can't be negative
            propertyValue: currentPropertyValue
        });

        // C6.0: Breakeven Point Determination
        if (breakevenPoint === null && cumulativeBuyingCost < cumulativeRentingCost) {
            breakevenPoint = year;
        }
    }


    return {
        grossMonthlyMortgage,
        monthlyInterest,
        monthlyPrincipal,
        estimatedSalePrice: P,
        totalUpfrontCosts,
        monthlyMaintenance,
        monthlyTaxBenefit,
        monthlyEwfCost,
        totalNetMonthlyBuyingCost,
        monthlyCostDifferential,
        currentRentalExpenses: data.currentRentalExpenses,
        monthlyEquityAccumulation,
        netMonthlyRentalCost,
        huurtoeslagAmount,
        projection,
        breakevenPoint,
    };
}
