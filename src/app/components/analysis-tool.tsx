
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
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

const initialDefaultValues: AnalysisFormValues = {
  age: 30,
  annualIncome: 60000,
  employmentStatus: 'employed',
  savings: 25000,
  currentRentalExpenses: 1500,
  maxMortgage: 300000,
  overbidAmount: 20000,
  interestRate: 4.1,
  propertyTransferTaxPercentage: 2,
  otherUpfrontCostsPercentage: 3,
  maintenancePercentage: 1,
  isFirstTimeBuyer: false,
  marginalTaxRate: 37,
  midEligible: true,
  intendedLengthOfStay: 10,
  propertyAppreciationRate: 2,
  isEligibleForHuurtoeslag: false,
  householdSize: 'single',
  estimatedSellingCostsPercentage: 2,
};

export default function AnalysisTool() {
  const [results, setResults] = useState<CalculationOutput | null>(null);
  const [formErrors, setFormErrors] = useState<FieldErrors<AnalysisFormValues> | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisSchema),
    mode: 'onChange', // Validate on change to give instant feedback
  });

  // Effect for initial load from localStorage or defaults
  useEffect(() => {
    setIsClient(true);
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      let dataToLoad: AnalysisFormValues;
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const validation = analysisSchema.safeParse(parsedData);
        if (validation.success) {
          dataToLoad = validation.data;
        } else {
          // Saved data is invalid, use defaults
          dataToLoad = initialDefaultValues;
        }
      } else {
        // No saved data, use defaults
        dataToLoad = initialDefaultValues;
      }
      form.reset(dataToLoad);
      setResults(performCalculations(dataToLoad));

    } catch (error) {
      console.error("Failed to read from localStorage, using defaults", error);
      form.reset(initialDefaultValues);
      setResults(performCalculations(initialDefaultValues));
    }
  }, [form]);


  // Effect for watching changes and re-calculating/saving
  useEffect(() => {
    const subscription = form.watch((values, { name, type }) => {
      // Don't do anything if not a client yet
      if (!isClient) return;

      const validation = analysisSchema.safeParse(values);
      if (validation.success) {
        setResults(performCalculations(validation.data));
        setFormErrors(null);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(validation.data));
      } else {
        setResults(null);
        setFormErrors(validation.error.formErrors.fieldErrors);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isClient]);

  const handleClearForm = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    form.reset({});
    setResults(null);
    setFormErrors(null);
    toast({
      title: "Form Cleared",
      description: "Your inputs have been cleared.",
    });
  }, [form, toast]);


  if (!isClient) {
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
            <InputForm form={form} onClear={handleClearForm} />
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
