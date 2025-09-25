import type { AnalysisFormValues } from './schema';

export type CalculationInput = Pick<AnalysisFormValues, 'maxMortgage' | 'interestRate' | 'savings' | 'upfrontCostPercentage' | 'maintenancePercentage' | 'currentRentalExpenses'>;

export type CalculationOutput = {
    grossMonthlyMortgage: number;
    estimatedSalePrice: number;
    totalUpfrontCosts: number;
    monthlyMaintenance: number;
    totalGrossMonthlyBuyingCost: number;
    monthlyCostDifferential: number;
    currentRentalExpenses: number;
};

export function performCalculations(data: CalculationInput): CalculationOutput {
    // P1.0: Gross Monthly Mortgage (P&I)
    const M = data.maxMortgage;
    const annualRate = data.interestRate / 100;
    const monthlyRate = annualRate / 12;
    const n = 30 * 12; // 30 years

    const grossMonthlyMortgage = M > 0 && monthlyRate > 0
        ? M * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
        : (M > 0 ? M / n : 0);

    // P2.0: Estimated Sale Price (P)
    const P = data.maxMortgage + data.savings;

    // P3.0: Total Upfront Costs (One-Time)
    const totalUpfrontCosts = P * (data.upfrontCostPercentage / 100);

    // P4.0: Estimated Monthly Maintenance
    const monthlyMaintenance = (P * (data.maintenancePercentage / 100)) / 12;

    // P5.0: Total Gross Buying Housing Cost
    const totalGrossMonthlyBuyingCost = grossMonthlyMortgage + monthlyMaintenance;

    // P6.0: Comparison Calculation
    const monthlyCostDifferential = totalGrossMonthlyBuyingCost - data.currentRentalExpenses;

    return {
        grossMonthlyMortgage,
        estimatedSalePrice: P,
        totalUpfrontCosts,
        monthlyMaintenance,
        totalGrossMonthlyBuyingCost,
        monthlyCostDifferential,
        currentRentalExpenses: data.currentRentalExpenses
    };
}
