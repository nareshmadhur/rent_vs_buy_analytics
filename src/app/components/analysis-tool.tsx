
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
  const isClearingRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisSchema),
    mode: 'onChange', // Validate on change
    defaultValues: initialDefaultValues,
  });
  
  const onSubmit = useCallback((data: AnalysisFormValues) => {
    console.log('Form submitted with data:', data);
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        const calculatedResults = performCalculations(data);
        console.log('Calculated results:', calculatedResults);
        setResults(calculatedResults);
        setFormErrors(null); // Clear errors on successful calculation
    } catch (error) {
        console.error('Caught an error during calculation:', error);
        setResults(null);
        toast({
            variant: "destructive",
            title: "Calculation Error",
            description: "An unexpected error occurred during calculation."
        });
    }
  }, [toast]);

  const handleValidationErrors = (errors: FieldErrors<AnalysisFormValues>) => {
    setResults(null); // Clear previous results
    setFormErrors(errors);
  };


  useEffect(() => {
    if (!isClient) return;

    let initialData = initialDefaultValues;
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        initialData = { ...initialDefaultValues, ...parsedData };
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
    form.reset(initialData);

    // Initial validation check
    form.trigger().then(isValid => {
      if (isValid) {
        onSubmit(form.getValues());
      } else {
        handleValidationErrors(form.formState.errors);
      }
    });

  }, [form, isClient, onSubmit]); 

  useEffect(() => {
    if (!isClient) return;

    const subscription = form.watch((values, { name, type }) => {
        if (isClearingRef.current) {
            return;
        }

        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values));
        } catch (error) {
            console.error("Failed to save to localStorage", error);
        }
        
        // When a field changes, re-validate and submit if valid
        form.trigger().then(isValid => {
           if (isValid) {
               onSubmit(form.getValues());
           } else {
               handleValidationErrors(form.formState.errors);
           }
        });
    });

    return () => subscription.unsubscribe();
  }, [form, isClient, onSubmit]);

  const handleClearForm = useCallback(() => {
    isClearingRef.current = true;
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      form.reset(initialDefaultValues);
      setResults(null);
      setFormErrors(null);
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
    } finally {
        // Use a timeout to reset the flag after the current render cycle,
        // which includes the `watch` effect.
        setTimeout(() => {
            isClearingRef.current = false;
        }, 0);
    }
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
