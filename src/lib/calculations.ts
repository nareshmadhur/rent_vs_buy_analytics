import type { AnalysisFormValues } from './schema';

export type CalculationInput = AnalysisFormValues;

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

    // Equity
    monthlyEquityAccumulation: number;
};

// Statutory rates
const EWF_RATE = 0.0035; // 0.35%
const TRANSFER_TAX_RATE = 0.02; // 2%

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
    const baseUpfrontCosts = P * (data.upfrontCostPercentage / 100);
    const transferTaxCost = P * TRANSFER_TAX_RATE;
    const isTransferTaxWaived = data.isFirstTimeBuyer && data.age < 35;
    const totalUpfrontCosts = isTransferTaxWaived ? baseUpfrontCosts - transferTaxCost : baseUpfrontCosts;

    // Estimated Monthly Maintenance
    const monthlyMaintenance = (P * (data.maintenancePercentage / 100)) / 12;
    
    // P5.0: Total Net Buying Housing Cost
    const totalGrossMonthlyBuyingCost = grossMonthlyMortgage + monthlyMaintenance;
    const totalNetMonthlyBuyingCost = totalGrossMonthlyBuyingCost - monthlyTaxBenefit + monthlyEwfCost;

    // P6.0: Monthly Equity Accumulation
    const monthlyEquityAccumulation = monthlyPrincipal;

    // Comparison Calculation (using Net cost)
    const monthlyCostDifferential = totalNetMonthlyBuyingCost - data.currentRentalExpenses;

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
        monthlyEquityAccumulation
    };
}
