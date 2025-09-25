import { z } from 'zod';

export const analysisSchema = z.object({
  age: z.coerce.number().int().positive({ message: "Age must be a positive number." }).min(18, { message: "Must be at least 18." }).max(100, { message: "Age must be realistic." }),
  annualIncome: z.coerce.number().positive({ message: "Income must be a positive number." }),
  employmentStatus: z.enum(['employed', 'self-employed', 'other'], { required_error: "Employment status is required." }),
  savings: z.coerce.number().min(0, { message: "Savings cannot be negative." }),
  currentRentalExpenses: z.coerce.number().positive({ message: "Rent must be a positive number." }),
  maxMortgage: z.coerce.number().positive({ message: "Mortgage must be a positive number." }),
  interestRate: z.coerce.number().positive({ message: "Rate must be a positive number." }).max(20, { message: "Rate seems too high." }),
  upfrontCostPercentage: z.coerce.number().positive({ message: "Percentage must be positive." }).max(20, { message: "Percentage seems too high." }).default(5),
  maintenancePercentage: z.coerce.number().positive({ message: "Percentage must be positive." }).max(10, { message: "Percentage seems too high." }).default(1),
  // Stage 2 fields
  isFirstTimeBuyer: z.boolean().default(false),
  marginalTaxRate: z.coerce.number().min(0).max(100).default(37),
  midEligible: z.boolean().default(true),
});

export type AnalysisFormValues = z.infer<typeof analysisSchema>;
