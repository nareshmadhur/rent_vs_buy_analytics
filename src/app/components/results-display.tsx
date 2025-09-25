"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CostComparisonChart from './cost-comparison-chart';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Home, Building } from 'lucide-react';
import type { CalculationOutput } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';

interface ResultsDisplayProps {
  results: CalculationOutput | null;
}

const ScoreCard = ({ title, value, description, icon: Icon, colorClass = 'text-primary' }: { title: string, value: string, description: string, icon: React.ElementType, colorClass?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-5 w-5 text-muted-foreground ${colorClass}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results) {
    return (
      <Card className="flex flex-col items-center justify-center h-full min-h-[500px] bg-secondary/50 border-dashed">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Awaiting Your Analysis</CardTitle>
          <CardDescription>Fill in your details on the left to see your results.</CardDescription>
        </CardHeader>
        <CardContent className="w-full max-w-md space-y-4 p-6">
            <div className="space-y-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-40 w-full" />
            </div>
        </CardContent>
      </Card>
    );
  }

  const { totalUpfrontCosts, totalGrossMonthlyBuyingCost, currentRentalExpenses, monthlyCostDifferential } = results;

  const isBuyingCheaper = monthlyCostDifferential < 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Results Scorecard</CardTitle>
          <CardDescription>An overview of your rent vs. buy comparison.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <ScoreCard
            title="Upfront Buying Costs"
            value={formatCurrency(totalUpfrontCosts)}
            description="One-time expenses."
            icon={Wallet}
            colorClass="text-accent-foreground"
          />
          <ScoreCard
            title="Gross Monthly Rent"
            value={formatCurrency(currentRentalExpenses)}
            description="Your current situation."
            icon={Building}
          />
          <ScoreCard
            title="Gross Monthly Buy"
            value={formatCurrency(totalGrossMonthlyBuyingCost)}
            description="Mortgage + maintenance."
            icon={Home}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Cost Comparison</CardTitle>
          <CardDescription>Visualizing your monthly housing expenses.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <CostComparisonChart
            rentingCost={currentRentalExpenses}
            buyingCost={totalGrossMonthlyBuyingCost}
          />
        </CardContent>
      </Card>

      <Card className={isBuyingCheaper ? "bg-green-100 dark:bg-green-900/20 border-green-500" : "bg-red-100 dark:bg-red-900/20 border-red-500"}>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          {isBuyingCheaper ? <TrendingDown className="w-8 h-8 text-green-700 dark:text-green-400" /> : <TrendingUp className="w-8 h-8 text-red-700 dark:text-red-400" />}
          <div>
            <CardTitle>Monthly Differential</CardTitle>
            <CardDescription className={isBuyingCheaper ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}>
              {isBuyingCheaper
                ? `Buying is ${formatCurrency(Math.abs(monthlyCostDifferential))} cheaper per month.`
                : `Buying is ${formatCurrency(monthlyCostDifferential)} more expensive per month.`}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
