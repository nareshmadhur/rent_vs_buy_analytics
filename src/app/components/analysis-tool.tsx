
"use client";

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import type { AnalysisFormValues } from '@/lib/schema';
import { analysisSchema } from '@/lib/schema';
import { performCalculations, type CalculationOutput } from '@/lib/calculations';
import InputForm from './input-form';
import ResultsDisplay from './results-display';
import { useToast } from '@/hooks/use-toast';
import type { FieldErrors } from 'react-hook-form';

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
  const { toast } = useToast();

  const form = useForm<AnalysisFormValues>();

  const onSubmit = (data: AnalysisFormValues) => {
    // Manually validate with zod before calculating
    const validation = analysisSchema.safeParse(data);
    if (validation.success) {
      setResults(performCalculations(validation.data));
    } else {
      setResults(null);
      // Optional: Show a toast or log errors
      toast({
        variant: "destructive",
        title: "Invalid data",
        description: "Please check the form fields and try again.",
      });
    }
  };

  const handleClearForm = useCallback(() => {
    form.reset({
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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-6 border-b">
        <h1 className="text-3xl font-bold text-primary font-headline">Hypotheek Analyse</h1>
        <p className="text-muted-foreground">Analyse the net monthly costs of buying vs. renting and see your equity grow.</p>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <InputForm form={form} onClear={handleClearForm} onLoadExample={handleLoadExample} onSubmit={form.handleSubmit(onSubmit)} />
          </div>
          <div className="lg:col-span-3">
            <ResultsDisplay results={results} errors={null} />
          </div>
        </div>
      </main>
      <footer className="mt-8 py-4 text-center text-sm text-muted-foreground">
        Disclaimer: This is an analysis for comparison, not financial advice. Consult with a certified financial advisor.
      </footer>
    </div>
  );
}
