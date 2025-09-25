
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CostComparisonChart from './cost-comparison-chart';
import { formatCurrency } from '@/lib/utils';
import { Wallet, Home, Building, PiggyBank, BadgePercent, Landmark, Info, BarChart, Trophy, FileText } from 'lucide-react';
import type { CalculationOutput } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectionChart from './projection-chart';

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

const QualitativeFactors = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Beyond the Numbers
            </CardTitle>
            <CardDescription>The final decision isn't just financial. Here are some qualitative factors to consider.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
            <div>
                <h4 className="font-semibold">Flexibility (Advantage: Renting)</h4>
                <p className="text-muted-foreground">Renting offers the ability to move easily with short notice, ideal if your career or life plans are uncertain.</p>
            </div>
            <div>
                <h4 className="font-semibold">Stability & Personalization (Advantage: Buying)</h4>
                <p className="text-muted-foreground">Owning a home provides stability, protection from rent hikes, and the freedom to renovate and make it truly yours.</p>
            </div>
             <div>
                <h4 className="font-semibold">Maintenance & Hassle (Advantage: Renting)</h4>
                <p className="text-muted-foreground">Renters can call the landlord for repairs. Homeowners are responsible for all maintenance, which costs time and money.</p>
            </div>
             <div>
                <h4 className="font-semibold">Emotional Value (Advantage: Buying)</h4>
                <p className="text-muted-foreground">For many, owning a home provides a deep sense of security, community, and personal accomplishment that can't be quantified.</p>
            </div>
        </CardContent>
    </Card>
)

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results) {
    return (
      <Card className="flex flex-col items-center justify-center h-full min-h-[500px] bg-secondary/50 border-dashed">
        <CardHeader className="text-center">
          <Info className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="text-2xl">Awaiting Your Analysis</CardTitle>
          <CardDescription>Fill in all fields on the left and click "Analyze".</CardDescription>
        </CardHeader>
        <CardContent className="w-full max-w-md space-y-4 p-6">
            <div className="space-y-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
            <div className="space-y-2 pt-4">
                <Skeleton className="h-40 w-full" />
            </div>
        </CardContent>
      </Card>
    );
  }

  const {
    totalUpfrontCosts,
    totalNetMonthlyBuyingCost,
    monthlyEquityAccumulation,
    monthlyTaxBenefit,
    monthlyEwfCost,
    netMonthlyRentalCost,
    huurtoeslagAmount,
    projection,
    breakevenPoint,
    monthlyInterest,
    monthlyPrincipal,
    monthlyMaintenance,
    realizedValueOnSale,
  } = results;

  const stayDuration = projection.length > 0 ? projection[projection.length - 1].year : 0;
  const doesBreakeven = breakevenPoint !== null;

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Net Monthly Cost Comparison</CardTitle>
          <CardDescription>Visualizing your initial monthly housing expenses after tax and subsidy adjustments.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <CostComparisonChart
            rentingCost={netMonthlyRentalCost}
            buyingCostBreakdown={{
                principal: monthlyPrincipal,
                interest: monthlyInterest,
                maintenance: monthlyMaintenance,
                ewf: monthlyEwfCost,
                taxBenefit: monthlyTaxBenefit,
            }}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={doesBreakeven ? "bg-green-100 dark:bg-green-900/20 border-green-500" : "bg-amber-100 dark:bg-amber-900/20 border-amber-500"}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Trophy className={`w-8 h-8 ${doesBreakeven ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`} />
            <div>
                <CardTitle>True Financial Breakeven</CardTitle>
                <CardDescription className={doesBreakeven ? "text-green-800 dark:text-green-300" : "text-amber-800 dark:text-amber-300"}>
                {doesBreakeven
                    ? `Buying becomes cheaper than renting in Year ${breakevenPoint}.`
                    : `Buying does not break even with renting within the ${stayDuration}-year timeline.`}
                </CardDescription>
            </div>
            </CardHeader>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <PiggyBank className="w-8 h-8 text-primary" />
            <div>
                <CardTitle>Net Realized Value</CardTitle>
                <CardDescription>
                    After {stayDuration} years, selling could net you
                    <span className="font-bold text-foreground"> {formatCurrency(realizedValueOnSale)} </span>
                    in cash.
                </CardDescription>
            </div>
            </CardHeader>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            {stayDuration}-Year Financial Projection
          </CardTitle>
          <CardDescription>Comparing the total cumulative costs and equity growth over time, including asset realization.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ProjectionChart data={projection} breakevenYear={breakevenPoint} />
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Net Results Scorecard</CardTitle>
          <CardDescription>A detailed breakdown of your rent vs. buy comparison with tax and subsidy effects.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ScoreCard
            title="Net Monthly Buy Cost"
            value={formatCurrency(totalNetMonthlyBuyingCost)}
            description="After tax benefit & EWF."
            icon={Home}
          />
           <ScoreCard
            title="Net Monthly Rent Cost"
            value={formatCurrency(netMonthlyRentalCost)}
            description={huurtoeslagAmount > 0 ? `After ${formatCurrency(huurtoeslagAmount)} subsidy` : 'Your current situation.'}
            icon={Building}
          />
          <ScoreCard
            title="Monthly Equity"
            value={formatCurrency(monthlyEquityAccumulation)}
            description="Initial investment in your home."
            icon={PiggyBank}
            colorClass="text-green-600"
          />
          <ScoreCard
            title="Upfront Buying Costs"
            value={formatCurrency(totalUpfrontCosts)}
            description="One-time expenses (net)."
            icon={Wallet}
            colorClass="text-amber-600"
          />
          <ScoreCard
            title="Monthly Tax Benefit"
            value={formatCurrency(monthlyTaxBenefit)}
            description="From interest deduction."
            icon={BadgePercent}
            colorClass="text-green-600"
          />
          <ScoreCard
            title="Monthly EWF Tax"
            value={formatCurrency(monthlyEwfCost)}
            description="Notional rental income tax."
            icon={Landmark}
            colorClass="text-red-600"
          />
        </CardContent>
      </Card>

      <QualitativeFactors />
    </div>
  );
}
