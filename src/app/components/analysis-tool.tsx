
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

export default function AnalysisTool() {
  const [results, setResults] = useState<CalculationOutput | null>(null);
  const [formErrors, setFormErrors] = useState<FieldErrors<AnalysisFormValues> | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisSchema),
    mode: 'onChange', // Validate on every change
  });

  // Effect for initial load from localStorage. Runs ONLY ONCE.
  useEffect(() => {
    setIsClient(true);
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Use safeParse to avoid throwing errors on invalid stored data
        const validation = analysisSchema.safeParse(parsedData);
        if (validation.success) {
          form.reset(validation.data); // Set the form with saved data
        } else {
          // If data in localStorage is invalid, start fresh
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to read or parse from localStorage", error);
      // Ensure a clean state if localStorage is corrupted
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [form]);


  // Effect for watching form changes, validating, and performing calculations.
  useEffect(() => {
    // This subscription is active only on the client
    if (!isClient) return;

    const subscription = form.watch((values) => {
      // Attempt to validate the current form values
      const validation = analysisSchema.safeParse(values);

      if (validation.success) {
        // If validation succeeds:
        // 1. Perform calculations and update results
        const newResults = performCalculations(validation.data);
        setResults(newResults);
        // 2. Clear any previous form errors
        setFormErrors(null);
        // 3. Save the valid data to localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(validation.data));
      } else {
        // If validation fails:
        // 1. Clear the results to show the "Awaiting Analysis" pane
        setResults(null);
        // 2. Set the form errors to display what's missing
        setFormErrors(validation.error.formErrors.fieldErrors);
        // 3. Optional: Remove invalid data from localStorage to prevent reloading bad state
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, isClient]); // Re-run if form instance or isClient changes

  // Function to clear the form
  const handleClearForm = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    form.reset({}); // Reset to a completely empty state
    setResults(null);
    setFormErrors(null);
    toast({
      title: "Form Cleared",
      description: "Your inputs have been cleared.",
    });
  }, [form, toast]);


  if (!isClient) {
    // Render nothing on the server to avoid hydration mismatches
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
