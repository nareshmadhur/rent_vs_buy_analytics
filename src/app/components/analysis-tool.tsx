
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AnalysisFormValues } from '@/lib/schema';
import { analysisSchema } from '@/lib/schema';
import { performCalculations, type CalculationOutput } from '@/lib/calculations';
import InputForm from './input-form';
import ResultsDisplay from './results-display';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FieldErrors } from 'react-hook-form';

const LOCAL_STORAGE_KEY = 'mortgageAnalysisData';

const exampleData: AnalysisFormValues = {
  age: 30,
  annualIncome: 65000,
  employmentStatus: 'employed',
  savings: 30000,
  currentRentalExpenses: 1600,
  maxMortgage: 350000,
  overbidAmount: 25000,
  interestRate: 4.2,
  propertyTransferTaxPercentage: 0,
  otherUpfrontCostsPercentage: 3,
  maintenancePercentage: 1,
  isFirstTimeBuyer: true,
  marginalTaxRate: 37,
  midEligible: true,
  intendedLengthOfStay: 10,
  propertyAppreciationRate: 2.5,
  estimatedSellingCostsPercentage: 2,
  isEligibleForHuurtoeslag: false,
  householdSize: 'single',
};


export default function AnalysisTool() {
  const [results, setResults] = useState<CalculationOutput | null>(null);
  const [formErrors, setFormErrors] = useState<FieldErrors<AnalysisFormValues> | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisSchema),
    mode: 'onChange', // Validate on change to get real-time feedback
  });

  // Effect to load data from localStorage on initial mount
  useEffect(() => {
    setIsClient(true);
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Use zod to safely parse and validate the saved data
        const validation = analysisSchema.safeParse(parsedData);
        if (validation.success) {
          form.reset(validation.data); // Load valid saved data into the form
        } else {
          // If saved data is invalid, remove it
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
      // Ensure bad data is removed if parsing fails
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [form]); // form.reset is stable, so this runs once on mount

  // Effect to watch for form changes, validate, and perform calculations
  useEffect(() => {
    // Don't run on the server
    if (!isClient) return;

    // Subscribe to form changes
    const subscription = form.watch((values) => {
      // Attempt to validate the form with the current values
      const validation = analysisSchema.safeParse(values);

      if (validation.success) {
        // If the form is valid, perform calculations and update state
        setResults(performCalculations(validation.data));
        setFormErrors(null); // Clear any previous errors
        // Save the valid data to localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(validation.data));
      } else {
        // If the form is invalid, clear the results and store the errors
        setResults(null);
        setFormErrors(validation.error.formErrors.fieldErrors);
      }
    });

    // Cleanup the subscription when the component unmounts
    return () => subscription.unsubscribe();
  }, [form, isClient]); // Re-run if form instance or client status changes


  const handleClearForm = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    form.reset({
        // Reset with undefined for zod coercion to work correctly
        age: undefined,
        annualIncome: undefined,
        employmentStatus: undefined,
        savings: undefined,
        currentRentalExpenses: undefined,
        maxMortgage: undefined,
        overbidAmount: undefined,
        interestRate: undefined,
        propertyTransferTaxPercentage: undefined,
        otherUpfrontCostsPercentage: undefined,
        maintenancePercentage: undefined,
        isFirstTimeBuyer: false,
        marginalTaxRate: undefined,
        midEligible: true,
        intendedLengthOfStay: undefined,
        propertyAppreciationRate: undefined,
        estimatedSellingCostsPercentage: undefined,
        isEligibleForHuurtoeslag: false,
        householdSize: undefined,
    }); 
    setResults(null);
    setFormErrors(null);
    toast({
      title: "Form Cleared",
      description: "Your inputs have been cleared.",
    });
  }, [form, toast]);

  const handleLoadExample = useCallback(() => {
    form.reset(exampleData);
    toast({
        title: "Example Loaded",
        description: "A sample scenario has been loaded into the form.",
    });
  }, [form, toast]);

  if (!isClient) {
    // Render a placeholder or nothing on the server to avoid hydration mismatch
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-6 border-b">
        <h1 className="text-3xl font-bold text-primary font-headline">Hypotheek Analyse</h1>
        <p className="text-muted-foreground">Analyse the net monthly costs of buying vs. renting and see your equity grow.</p>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <InputForm form={form} onClear={handleClearForm} onLoadExample={handleLoadExample} />
          </div>
          <div className="lg:col-span-3">
            <ResultsDisplay results={results} errors={formErrors} />
          </div>
        </div>
      </main>
      <footer className="mt-8">
        <Card className="rounded-none border-t-4 border-accent bg-secondary">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-accent-foreground" />
            <div>
              <h3 className="font-bold text-accent-foreground">Disclaimer: Estimation Only</h3>
              <p className="text-sm text-muted-foreground">
                These results are estimations based on the data provided and common tax rules. This is an analysis for comparison, not financial advice. Consult with a certified financial advisor.
              </p>
            </div>
          </CardContent>
        </Card>
      </footer>
    </div>
  );
}
