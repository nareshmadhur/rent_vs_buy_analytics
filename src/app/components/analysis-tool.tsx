"use client";

import React, { useState, useCallback, useMemo } from 'react';
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

export default function AnalysisTool() {
  const [results, setResults] = useState<CalculationOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisSchema),
    mode: 'onChange',
    defaultValues: {
      age: undefined,
      annualIncome: undefined,
      employmentStatus: 'employed',
      savings: 0,
      currentRentalExpenses: undefined,
      maxMortgage: undefined,
      interestRate: undefined,
      upfrontCostPercentage: 5,
      maintenancePercentage: 1,
      isFirstTimeBuyer: false,
      marginalTaxRate: 37,
      midEligible: true,
    },
  });

  const handleFormChange = useCallback((data: AnalysisFormValues) => {
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
  }, []);

  const memoizedForm = useMemo(() => form, [form]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-6 border-b">
        <h1 className="text-3xl font-bold text-primary font-headline">Hypotheek Analyse</h1>
        <p className="text-muted-foreground">Analyse the net monthly costs of buying vs. renting and see your equity grow.</p>
      </header>
      <div className="flex-grow container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <InputForm form={memoizedForm} onValuesChange={handleFormChange} />
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
