
import { z } from 'zod';

// We still need a schema to define the types, but it's much simpler now.
// We make most fields optional and coerce them to handle empty inputs gracefully.
export const analysisSchema = z.object({
  age: z.coerce.number({invalid_type_error: "Age is required"}).positive().min(18).max(100),
  annualIncome: z.coerce.number({invalid_type_error: "Income is required"}).positive(),
  employmentStatus: z.enum(['employed', 'self-employed', 'other'], {required_error: "Employment status is required."}),
  savings: z.coerce.number({invalid_type_error: "Savings are required"}).min(0),
  currentRentalExpenses: z.coerce.number({invalid_type_error: "Current rent is required"}).positive(),
  maxMortgage: z.coerce.number({invalid_type_error: "Mortgage amount is required"}).positive(),
  overbidAmount: z.coerce.number().nonnegative().optional().default(0),
  interestRate: z.coerce.number({invalid_type_error: "Interest rate is required"}).positive().max(20),
  propertyTransferTaxPercentage: z.coerce.number().nonnegative().max(10).optional().default(2),
  otherUpfrontCostsPercentage: z.coerce.number({invalid_type_error: "Other costs are required"}).nonnegative().max(10),
  maintenancePercentage: z.coerce.number({invalid_type_error: "Maintenance is required"}).nonnegative().max(10),
  isFirstTimeBuyer: z.boolean().default(false),
  marginalTaxRate: z.coerce.number({invalid_type_error: "Tax rate is required"}).min(0).max(100),
  midEligible: z.boolean().default(true),

  // Stage 3 inputs
  intendedLengthOfStay: z.coerce.number({invalid_type_error: "Length of stay is required"}).int().min(1).max(30),
  propertyAppreciationRate: z.coerce.number({invalid_type_error: "Appreciation rate is required"}).min(-5).max(20),
  estimatedSellingCostsPercentage: z.coerce.number({invalid_type_error: "Selling costs are required"}).nonnegative().max(10),

  // Huurtoeslag
  isEligibleForHuurtoeslag: z.boolean().default(false),
  householdSize: z.enum(['single', 'couple']).optional(),
}).refine(data => data.isEligibleForHuurtoeslag ? !!data.householdSize : true, {
    message: "Household size is required when rent allowance is selected.",
    path: ["householdSize"],
});

export type AnalysisFormValues = z.infer<typeof analysisSchema>;

    