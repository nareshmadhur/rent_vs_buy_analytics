
import { z } from 'zod';

export const analysisSchema = z.object({
  age: z.coerce.number().int().positive({ message: "Age must be a positive number." }).min(18, { message: "Must be at least 18." }).max(100, { message: "Age must be realistic." }).optional().or(z.literal('')),
  annualIncome: z.coerce.number().positive({ message: "Income must be a positive number." }).optional().or(z.literal('')),
  employmentStatus: z.enum(['employed', 'self-employed', 'other'], { required_error: "Employment status is required." }).default('employed'),
  savings: z.coerce.number().min(0, { message: "Savings cannot be negative." }),
  currentRentalExpenses: z.coerce.number().positive({ message: "Rent must be a positive number." }).optional().or(z.literal('')),
  maxMortgage: z.coerce.number().positive({ message: "Mortgage must be a positive number." }).optional().or(z.literal('')),
  interestRate: z.coerce.number().positive({ message: "Rate must be a positive number." }).max(20, { message: "Rate seems too high." }).optional().or(z.literal('')),
  propertyTransferTaxPercentage: z.coerce.number().nonnegative({ message: "Percentage must be non-negative." }).max(10, { message: "Percentage seems too high." }).default(2),
  otherUpfrontCostsPercentage: z.coerce.number().positive({ message: "Percentage must be positive." }).max(10, { message: "Percentage seems too high." }).default(3),
  maintenancePercentage: z.coerce.number().positive({ message: "Percentage must be positive." }).max(10, { message: "Percentage seems too high." }).default(1),
  isFirstTimeBuyer: z.boolean().default(false),
  marginalTaxRate: z.coerce.number().min(0).max(100).default(37),
  midEligible: z.boolean().default(true),

  // Stage 3 inputs
  intendedLengthOfStay: z.coerce.number().int().min(1, 'Must be at least 1 year.').max(30, 'Cannot exceed 30 years.').default(10),
  propertyAppreciationRate: z.coerce.number().min(-5).max(20).default(2),
  isEligibleForHuurtoeslag: z.boolean().default(false),
  householdSize: z.enum(['single', 'couple']).default('single'),
});

export type AnalysisFormValues = z.infer<typeof analysisSchema>;
