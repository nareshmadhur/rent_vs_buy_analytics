
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

const LOCAL_STORAGE_KEY = 'mortgageAnalysisData';

const initialDefaultValues: AnalysisFormValues = {
  age: 30,
  annualIncome: 60000,
  employmentStatus: 'employed',
  savings: 25000,
  currentRentalExpenses: 1500,
  maxMortgage: 300000,
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
};


export default function AnalysisTool() {
  const [results, setResults] = useState<CalculationOutput | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisSchema),
    mode: 'onSubmit',
    defaultValues: initialDefaultValues,
  });

  useEffect(() => {
    if (!isClient) return;

    let initialData = initialDefaultValues;
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // We only parse, we don't validate here on load.
        // The user can re-submit to validate and calculate.
        initialData = { ...initialDefaultValues, ...parsedData };
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
    form.reset(initialData);

  }, [form, isClient]); 

  useEffect(() => {
    if (!isClient) return;

    const subscription = form.watch((values) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values));
        } catch (error) {
            console.error("Failed to save to localStorage", error);
        }
    });

    return () => subscription.unsubscribe();
  }, [form, isClient]);

  const handleClearForm = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      form.reset(initialDefaultValues);
      setResults(null);
      toast({
        title: "Form Cleared",
        description: "Your inputs have been reset.",
      });
    } catch (error) {
      console.error("Failed to clear localStorage", error);
      toast({
        variant: "destructive",
        title: "Could not clear data",
        description: "There was an issue clearing the form data."
      });
    }
  }, [form, toast]);

  const onSubmit = (data: AnalysisFormValues) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        const calculatedResults = performCalculations(data);
        setResults(calculatedResults);
        toast({
            title: "Analysis Complete",
            description: "Your results have been updated.",
        });
    } catch (error) {
        setResults(null);
        toast({
            variant: "destructive",
            title: "Calculation Error",
            description: "An unexpected error occurred during calculation."
        });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-6 border-b">
        <h1 className="text-3xl font-bold text-primary font-headline">Hypotheek Analyse</h1>
        <p className="text-muted-foreground">Analyse the net monthly costs of buying vs. renting and see your equity grow.</p>
      </header>
      <div className="flex-grow container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <InputForm form={form} onSubmit={form.handleSubmit(onSubmit)} onClear={handleClearForm} />
          </div>
          <div className="lg:col-span-3">
            <ResultsDisplay results={results} />
          </div>
        </div>
      </div>
      <footer className="sticky bottom-0 mt-8">
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
