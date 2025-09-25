"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  age: undefined,
  annualIncome: undefined,
  employmentStatus: 'employed',
  savings: 0,
  currentRentalExpenses: undefined,
  maxMortgage: undefined,
  interestRate: undefined,
  propertyTransferTaxPercentage: 2,
  otherUpfrontCostsPercentage: 3,
  maintenancePercentage: 1,
  isFirstTimeBuyer: false,
  marginalTaxRate: 37,
  midEligible: true,
};


export default function AnalysisTool() {
  const [results, setResults] = useState<CalculationOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    let initialData = initialDefaultValues;
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Validate saved data before merging
        const validation = analysisSchema.partial().safeParse(parsedData);
        if (validation.success) {
          initialData = { ...initialDefaultValues, ...validation.data };
        }
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
    form.reset(initialData);
  }, [form]); // Only run once on mount

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

  const handleValuesChange = (data: AnalysisFormValues) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to localStorage", error);
      toast({
        variant: "destructive",
        title: "Could not save data",
        description: "Your changes will not be saved for the next session."
      });
    }

    analysisSchema.safeParseAsync(data)
      .then(validationResult => {
        if (validationResult.success) {
          const calculatedResults = performCalculations(validationResult.data);
          setResults(calculatedResults);
        } else {
          setResults(null);
        }
      })
      .catch(() => {
        setResults(null);
      });
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
            <InputForm form={form} onValuesChange={handleValuesChange} onClear={handleClearForm} />
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
