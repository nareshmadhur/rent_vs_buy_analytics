
import { z } from 'zod';

export const analysisSchema = z.object({
  age: z.coerce.number({ required_error: "Age is required." }).int().positive({ message: "Age must be a positive number." }).min(18, { message: "Must be at least 18." }).max(100, { message: "Age must be realistic." }),
  annualIncome: z.coerce.number({ required_error: "Annual income is required." }).positive({ message: "Income must be a positive number." }),
  employmentStatus: z.enum(['employed', 'self-employed', 'other'], { required_error: "Employment status is required." }),
  savings: z.coerce.number({ required_error: "Savings is required." }).min(0, { message: "Savings cannot be negative." }),
  currentRentalExpenses: z.coerce.number({ required_error: "Current rent is required." }).positive({ message: "Rent must be a positive number." }),
  maxMortgage: z.coerce.number({ required_error: "Max mortgage is required." }).positive({ message: "Mortgage must be a positive number." }),
  overbidAmount: z.coerce.number().nonnegative({ message: "Overbid must be a non-negative number." }).optional(),
  interestRate: z.coerce.number({ required_error: "Interest rate is required." }).positive({ message: "Rate must be a positive number." }).max(20, { message: "Rate seems too high." }),
  propertyTransferTaxPercentage: z.coerce.number().nonnegative({ message: "Percentage must be non-negative." }).max(10, { message: "Percentage seems too high." }),
  otherUpfrontCostsPercentage: z.coerce.number({ required_error: "Other costs are required." }).nonnegative({ message: "Percentage must be non-negative." }).max(10, { message: "Percentage seems too high." }),
  maintenancePercentage: z.coerce.number({ required_error: "Maintenance is required." }).nonnegative({ message: "Percentage must be non-negative." }).max(10, { message: "Percentage seems too high." }),
  isFirstTimeBuyer: z.boolean(),
  marginalTaxRate: z.coerce.number({ required_error: "Tax rate is required." }).min(0).max(100),
  midEligible: z.boolean(),

  // Stage 3 inputs
  intendedLengthOfStay: z.coerce.number({ required_error: "Length of stay is required." }).int().min(1, 'Must be at least 1 year.').max(30, 'Cannot exceed 30 years.'),
  propertyAppreciationRate: z.coerce.number({ required_error: "Appreciation rate is required." }).min(-5).max(20),
  estimatedSellingCostsPercentage: z.coerce.number({ required_error: "Selling costs are required."}).nonnegative().max(10),
  isEligibleForHuurtoeslag: z.boolean(),
  householdSize: z.enum(['single', 'couple']),
}).refine(data => data.isEligibleForHuurtoeslag ? !!data.householdSize : true, {
    message: "Household size is required when rent allowance is selected.",
    path: ["householdSize"],
});

export type AnalysisFormValues = z.infer<typeof analysisSchema>;
