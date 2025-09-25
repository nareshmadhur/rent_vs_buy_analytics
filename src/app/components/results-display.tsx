
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CostComparisonChart from './cost-comparison-chart';
import { formatCurrency } from '@/lib/utils';
import { Wallet, Home, Building, PiggyBank, BadgePercent, Landmark, Info, BarChart, Trophy, FileText, HelpCircle, TrendingUp, Sparkles, Scale } from 'lucide-react';
import type { CalculationOutput } from '@/lib/calculations';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectionChart from './projection-chart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface ResultsDisplayProps {
  results: CalculationOutput | null;
}

const StatCard = ({ title, value, description, icon: Icon, colorClass = 'text-primary' }: { title: string, value: string, description?: string, icon: React.ElementType, colorClass?: string }) => (
  <div className="flex items-start gap-4">
    <Icon className={`h-8 w-8 mt-1 shrink-0 ${colorClass}`} />
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  </div>
);


const QualitativeFactors = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Beyond the Numbers
            </CardTitle>
            <CardDescription>The final decision is not just financial. Here are some qualitative factors to consider.</CardDescription>
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
                <p className="text-muted-foreground">For many, owning a home provides a deep sense of security, community, and personal accomplishment that cannot be quantified.</p>
            </div>
        </CardContent>
    </Card>
);

const VerdictCard = ({ results }: { results: CalculationOutput }) => {
    const { breakevenPoint, projection, realizedValueOnSale, totalNetMonthlyBuyingCost, netMonthlyRentalCost } = results;
    const stayDuration = projection.length > 0 ? projection[projection.length - 1].year : 0;
    const doesBreakeven = breakevenPoint !== null && breakevenPoint <= stayDuration;

    const buyingIsCheaperMonthly = totalNetMonthlyBuyingCost < netMonthlyRentalCost;
    const monthlyDifference = Math.abs(totalNetMonthlyBuyingCost - netMonthlyRentalCost);

    let verdictTitle = '';
    let verdictDescription = '';

    if (doesBreakeven) {
        verdictTitle = `Buying becomes the cheaper option in Year ${breakevenPoint}.`;
        verdictDescription = `Over your ${stayDuration}-year timeline, the financial benefits of owning outweigh the initial costs.`;
    } else {
        verdictTitle = `Renting is the cheaper option for your ${stayDuration}-year timeline.`;
        verdictDescription = "The high upfront costs of buying are not recovered through equity and appreciation within your planned stay, making renting cheaper overall."
    }

    return (
        <Card className={`border-2 ${doesBreakeven ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'}`}>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Trophy className={`w-8 h-8 ${doesBreakeven ? 'text-green-600' : 'text-amber-600'}`} />
                    <div>
                        <CardTitle className="text-xl">{verdictTitle}</CardTitle>
                        <CardDescription className="text-sm">{verdictDescription}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col items-center">
                        <p className="text-sm text-muted-foreground">Monthly Cost</p>
                        <p className={`text-lg font-bold ${buyingIsCheaperMonthly ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(monthlyDifference)} / mo {buyingIsCheaperMonthly ? 'cheaper to buy' : 'cheaper to rent'}</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <p className="text-sm text-muted-foreground">Breakeven Point</p>
                        <p className="text-lg font-bold">{doesBreakeven ? `Year ${breakevenPoint}` : `> ${stayDuration} Years`}</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <p className="text-sm text-muted-foreground">Gain on Sale</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(realizedValueOnSale)}</p>
                        <p className="text-xs text-muted-foreground">after {stayDuration} years</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


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
    netMonthlyRentalCost,
    projection,
    breakevenPoint,
    monthlyInterest,
    monthlyPrincipal,
    monthlyMaintenance,
    monthlyEwfCost,
    monthlyTaxBenefit,
  } = results;

  const stayDuration = projection.length > 0 ? projection[projection.length - 1].year : 0;
  const breakevenData = breakevenPoint ? projection[breakevenPoint - 1] : null;

  return (
    <div className="space-y-8">
      
      {/* 1. Top Level Verdict */}
      <VerdictCard results={results} />
      
      {/* 2. The Starting Line: Upfront Investment */}
      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-primary"/>
                <CardTitle>The Starting Line: Your Upfront Investment</CardTitle>
            </div>
          <CardDescription>This is the initial cash required to purchase the home, paid on day one.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
            <StatCard 
                title="Total Upfront Costs"
                value={formatCurrency(totalUpfrontCosts)}
                description="Includes overbid, transfer tax, and other fees."
                icon={Sparkles}
                colorClass="text-amber-500"
            />
             <StatCard 
                title="Remaining Savings"
                value={formatCurrency(results.inputs.savings - totalUpfrontCosts)}
                description="After all initial costs are paid."
                icon={PiggyBank}
                colorClass="text-green-500"
            />
        </CardContent>
      </Card>

      {/* 3. The Daily Race: Monthly Cash Flow */}
       <Card>
        <CardHeader>
           <div className="flex items-center gap-3">
                <Scale className="w-6 h-6 text-primary"/>
                <CardTitle>The Daily Race: Net Monthly Cost Comparison</CardTitle>
            </div>
          <CardDescription>Visualizing your initial monthly housing expenses after all tax and subsidy adjustments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="min-h-[400px]">
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
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                 <StatCard 
                    title="Net Monthly Buy Cost"
                    value={formatCurrency(totalNetMonthlyBuyingCost)}
                    description="After tax benefit & EWF."
                    icon={Home}
                />
                <StatCard 
                    title="Net Monthly Rent Cost"
                    value={formatCurrency(netMonthlyRentalCost)}
                    description={results.huurtoeslagAmount > 0 ? `After ${formatCurrency(results.huurtoeslagAmount)} subsidy` : 'Your current situation.'}
                    icon={Building}
                />
                <StatCard 
                    title="Monthly Equity Gained"
                    value={formatCurrency(monthlyEquityAccumulation)}
                    description="Your direct investment into the home."
                    icon={TrendingUp}
                    colorClass="text-green-600"
                />
            </div>
        </CardContent>
      </Card>
      
      {/* 4. The Finish Line: Long-Term Outcome */}
       <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <BarChart className="w-6 h-6 text-primary"/>
                <CardTitle>The Finish Line: {stayDuration}-Year Financial Projection</CardTitle>
            </div>
          <CardDescription>Comparing total costs and wealth generation over your intended length of stay.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="min-h-[400px]">
                <ProjectionChart data={projection} breakevenYear={breakevenPoint} />
            </div>

             <div className={breakevenPoint ? "bg-secondary/50 dark:bg-secondary/20 border-l-4 border-primary p-4 rounded-r-lg" : "bg-amber-100 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg"}>
                <div className="flex items-start gap-3">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <HelpCircle className="w-5 h-5 text-muted-foreground mt-1" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p>The "True Breakeven" is the year when the total cost of renting finally exceeds the total net cost of owning. The net cost of owning is your total cash payments (upfront costs + monthly costs) <span className="font-bold">minus</span> the cash you would get back if you sold the house (equity + appreciation - selling costs).</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <div>
                        <h4 className="font-semibold">How to Read the "True Breakeven"</h4>
                        <p className={`text-sm mt-1 mb-3 ${breakevenPoint ? "text-muted-foreground" : "text-amber-800 dark:text-amber-300"}`}>
                            {breakevenPoint && breakevenData
                                ? `Buying becomes cheaper than renting in Year ${breakevenPoint}. Here is the math for that year:`
                                : `Buying does not financially break even with renting within your ${stayDuration}-year timeline.`}
                        </p>
                        {breakevenPoint && breakevenData && (
                            <div className="text-xs space-y-2 text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Total Rent Paid by Year {breakevenPoint}:</span>
                                <span className="font-medium text-foreground">{formatCurrency(breakevenData.cumulativeRentingCost)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between">
                                <span>Total Buying Costs Paid (cash):</span>
                                <span className="font-medium text-foreground">{formatCurrency(breakevenData.cumulativeBuyingCost)}</span>
                                </div>
                                <div className="flex justify-between">
                                <span>- Est. Value from Sale:</span>
                                <span className="font-medium text-green-600">-{formatCurrency(breakevenData.propertyValue - breakevenData.totalNetOwnershipCost - totalUpfrontCosts)}</span>
                                </div>
                                <div className="border-t my-1"></div>
                                <div className="flex justify-between font-bold">
                                <span>= True Cost of Owning:</span>
                                <span className="text-foreground">{formatCurrency(breakevenData.totalNetOwnershipCost)}</span>
                                </div>
                            </div>
                            <p className="text-xs pt-2">
                                At this point, the True Cost of Owning ({formatCurrency(breakevenData.totalNetOwnershipCost)}) becomes less than the Total Rent Paid ({formatCurrency(breakevenData.cumulativeRentingCost)}).
                            </p>
                            </div>
                        )}
                        {!breakevenPoint && (
                            <p className="text-xs text-muted-foreground">
                            Based on your projections, the high upfront costs of buying are not recovered through equity and appreciation within your planned stay, making renting the cheaper option over this period.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      <QualitativeFactors />
    </div>
  );
}
