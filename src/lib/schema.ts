
import { z } from 'zod';

// We still need a schema to define the types, but it's much simpler now.
// We make most fields optional and coerce them to handle empty inputs gracefully.
export const analysisSchema = z.object({
  age: z.coerce.number().positive().min(18).max(100),
  annualIncome: z.coerce.number().positive(),
  employmentStatus: z.enum(['employed', 'self-employed', 'other']),
  savings: z.coerce.number().min(0),
  currentRentalExpenses: z.coerce.number().positive(),
  maxMortgage: z.coerce.number().positive(),
  overbidAmount: z.coerce.number().nonnegative().default(0),
  interestRate: z.coerce.number().positive().max(20),
  propertyTransferTaxPercentage: z.coerce.number().nonnegative().max(10).default(2),
  otherUpfrontCostsPercentage: z.coerce.number().nonnegative().max(10),
  maintenancePercentage: z.coerce.number().nonnegative().max(10),
  isFirstTimeBuyer: z.boolean().default(false),
  marginalTaxRate: z.coerce.number().min(0).max(100),
  midEligible: z.boolean().default(true),

  // Stage 3 inputs
  intendedLengthOfStay: z.coerce.number().int().min(1).max(30),
  propertyAppreciationRate: z.coerce.number().min(-5).max(20),
  estimatedSellingCostsPercentage: z.coerce.number().nonnegative().max(10),

  // Huurtoeslag
  isEligibleForHuurtoeslag: z.boolean().default(false),
  householdSize: z.enum(['single', 'couple']).optional(),
}).refine(data => data.isEligibleForHuurtoeslag ? !!data.householdSize : true, {
    message: "Household size is required when rent allowance is selected.",
    path: ["householdSize"],
});

export type AnalysisFormValues = z.infer<typeof analysisSchema>;
