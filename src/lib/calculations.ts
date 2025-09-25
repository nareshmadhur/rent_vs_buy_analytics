
import type { AnalysisFormValues } from './schema';

export type CalculationInput = AnalysisFormValues;

export type YearlyProjection = {
    year: number;
    cumulativeBuyingCost: number;
    cumulativeRentingCost: number;
    accumulatedEquity: number;
    propertyValue: number;
    // C8.0 & C9.0 - True Net Cost of Ownership to find True Breakeven
    totalNetOwnershipCost: number; 
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
    realizedValueOnSale: number;

    // Stage 3: Long-term projection
    projection: YearlyProjection[];
    breakevenPoint: number | null; // This is now the "True Financial Breakeven"
    
    // Pass inputs through for display
    inputs: CalculationInput;
};

// Statutory rates
const EWF_RATE = 0.0035; // 0.35%

// C1.0: Simplified Huurtoeslag (Rent Allowance) Calculation
function calculateHuurtoeslag(income: number, rent: number, household: 'single' | 'couple'): number {
    const incomeLimit = household === 'single' ? 30000 : 38000;
    const rentLimit = 808; 

    if (income > incomeLimit || rent > rentLimit) {
        return 0;
    }
    const incomeRatio = 1 - (income / incomeLimit);
    const potentialSubsidy = (rent - 250) * 0.75; 
    const calculatedSubsidy = Math.max(0, potentialSubsidy * incomeRatio);
    return Math.min(calculatedSubsidy, 350);
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

    // Agreed Purchase Price (P) is the property's official value, mortgage is based on this.
    // The total cost to the user includes the overbid.
    const P = data.maxMortgage + (data.savings - (data.overbidAmount || 0)); // Simplified: assume rest of savings go to value.
    const propertyValue = data.maxMortgage;

    // L1.0 & P2.0: Monthly Tax Benefit (MID)
    const monthlyTaxBenefit = data.midEligible && monthlyInterest > 0
      ? monthlyInterest * (data.marginalTaxRate / 100)
      : 0;
      
    // P3.0: Monthly Eigenwoningforfait Cost (EWF) - Based on official property value (WOZ), not overbid price
    const monthlyEwfCost = (propertyValue * EWF_RATE) / 12;

    // P4.0: Total Upfront Costs - REVISED
    const isTransferTaxWaived = data.isFirstTimeBuyer && data.age < 35;
    const transferTaxCost = isTransferTaxWaived ? 0 : propertyValue * (data.propertyTransferTaxPercentage / 100);
    const otherCosts = propertyValue * (data.otherUpfrontCostsPercentage / 100);
    const totalUpfrontCosts = transferTaxCost + otherCosts + (data.overbidAmount || 0);

    // Estimated Monthly Maintenance
    const monthlyMaintenance = (propertyValue * (data.maintenancePercentage / 100)) / 12;
    
    // P5.0: Total Net Buying Housing Cost (Cash Outflow)
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

    // C3.0 - C9.0: Long-Term Projection
    const projection: YearlyProjection[] = [];
    let breakevenPoint: number | null = null;
    let remainingMortgage = M;

    const annualNetBuyingCashOutflow = totalNetMonthlyBuyingCost * 12;
    const annualNetRentingCost = netMonthlyRentalCost * 12;
    let cumulativeBuyingCashOutflow = totalUpfrontCosts;
    let cumulativeRentingCost = 0;
    let currentPropertyValue = propertyValue;

    for (let year = 1; year <= data.intendedLengthOfStay; year++) {
        // C4.0: Cumulative Cost Tracking (Cash Outflow)
        cumulativeBuyingCashOutflow += annualNetBuyingCashOutflow;
        cumulativeRentingCost += annualNetRentingCost;

        // C5.0: Equity Calculation with Appreciation
        const annualPrincipalPaid = monthlyPrincipal * 12; // Simplified
        remainingMortgage -= annualPrincipalPaid;
        currentPropertyValue *= (1 + data.propertyAppreciationRate / 100);
        const accumulatedEquity = currentPropertyValue - remainingMortgage;

        // C7.0: Realized Value Upon Sale for this year
        const sellingCosts = currentPropertyValue * (data.estimatedSellingCostsPercentage / 100);
        const realizedValueOnSale = accumulatedEquity - sellingCosts;

        // C8.0: Total Net Cost of Ownership for this year
        const totalNetOwnershipCost = cumulativeBuyingCashOutflow - realizedValueOnSale;

        projection.push({
            year,
            cumulativeBuyingCost: cumulativeBuyingCashOutflow,
            cumulativeRentingCost,
            accumulatedEquity: Math.max(0, accumulatedEquity),
            propertyValue: currentPropertyValue,
            totalNetOwnershipCost,
        });

        // C9.0: True Financial Breakeven Point Determination
        if (breakevenPoint === null && totalNetOwnershipCost < cumulativeRentingCost) {
            breakevenPoint = year;
        }
    }
    
    // Final realized value at end of term
    const finalEquity = projection.length > 0 ? projection[projection.length - 1].accumulatedEquity : 0;
    const finalPropertyValue = projection.length > 0 ? projection[projection.length - 1].propertyValue : propertyValue;
    const finalSellingCosts = finalPropertyValue * (data.estimatedSellingCostsPercentage / 100);
    const realizedValueOnSale = finalEquity - finalSellingCosts;

    return {
        grossMonthlyMortgage,
        monthlyInterest,
        monthlyPrincipal,
        estimatedSalePrice: propertyValue,
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
        realizedValueOnSale,
        inputs: data,
    };
}
