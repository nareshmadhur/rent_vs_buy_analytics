
"use client";

import React from 'react';
import type { FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CostComparisonChart from './cost-comparison-chart';
import { formatCurrency } from '@/lib/utils';
import { Wallet, Home, Building, PiggyBank, BadgePercent, Landmark, Info, BarChart, Trophy, FileText, HelpCircle, TrendingUp, Sparkles, Scale, ListChecks } from 'lucide-react';
import type { CalculationOutput, AnalysisFormValues } from '@/lib/calculations';
import ProjectionChart from './projection-chart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface ResultsDisplayProps {
  results: CalculationOutput | null;
  errors: FieldErrors<AnalysisFormValues> | null;
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
    const stayDuration = projection.length > 1 ? projection[projection.length - 1].year : 0;
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

export default function ResultsDisplay({ results, errors }: ResultsDisplayProps) {
  if (!results) {
    return (
      <Card className="flex flex-col items-center justify-center h-full min-h-[500px] bg-secondary/50 border-dashed">
        <CardHeader className="text-center">
          <ListChecks className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="text-2xl">Awaiting Your Analysis</CardTitle>
          <CardDescription>
            Fill in the form and click "Calculate" to see your results.
          </CardDescription>
        </CardHeader>
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
    investmentBreakevenPoint,
    monthlyInterest,
    monthlyPrincipal,
    monthlyMaintenance,
    monthlyEwfCost,
    monthlyTaxBenefit,
  } = results;

  const stayDuration = projection.length > 1 ? projection[projection.length - 1].year : 0;
  const breakevenData = breakevenPoint && projection[breakevenPoint] ? projection[breakevenPoint] : null;
  const remainingSavings = results.inputs.savings - totalUpfrontCosts;
  const hasEnoughSavings = remainingSavings >= 0;

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
                value={formatCurrency(remainingSavings)}
                description={hasEnoughSavings ? "This is your cash buffer after all costs are paid." : "Uh-oh! You may not have enough savings to cover the initial investment."}
                icon={PiggyBank}
                colorClass={hasEnoughSavings ? "text-green-500" : "text-red-500"}
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
          <CardDescription>Visualizing your first month's housing expenses after all tax and subsidy adjustments.</CardDescription>
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
                <ProjectionChart data={projection} breakevenYear={breakevenPoint} investmentBreakevenYear={investmentBreakevenPoint} />
            </div>

             <div className="space-y-4">
                {/* Explanation for Rent vs Buy Breakeven */}
                <div className={breakevenPoint ? "bg-secondary/50 dark:bg-secondary/20 border-l-4 border-primary p-4 rounded-r-lg" : "bg-amber-100 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg"}>
                    <div className="flex items-start gap-3">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <HelpCircle className="w-5 h-5 text-primary mt-1" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>The "Rent vs. Buy Breakeven" is the year when the total cost of renting finally exceeds the total net cost of owning. The net cost of owning is your total cash payments (upfront costs + monthly costs) <span className="font-bold">minus</span> the cash you would get back if you sold the house (equity + appreciation - selling costs).</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <div>
                            <h4 className="font-semibold text-primary">How to Read the Rent vs. Buy Breakeven Point</h4>
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
                                    <span className="font-medium text-green-600">-{formatCurrency(breakevenData.cumulativeBuyingCost - breakevenData.totalNetOwnershipCost)}</span>
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
                        </div>
                    </div>
                </div>

                {/* Explanation for Investment Breakeven */}
                <div className={investmentBreakevenPoint ? "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg" : "bg-secondary/50 dark:bg-secondary/20 border-l-4 border-gray-400 p-4 rounded-r-lg"}>
                    <div className="flex items-start gap-3">
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                     <HelpCircle className={`w-5 h-5 mt-1 ${investmentBreakevenPoint ? "text-green-600" : "text-muted-foreground"}`} />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>The "Investment Breakeven" is the year when the profit from selling the house would be enough to cover all the cash you've paid over the years (upfront costs, mortgage payments, etc.). It's the point where your net cost of ownership becomes zero or less, effectively meaning you've "lived for free."</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <div>
                             <h4 className={`font-semibold ${investmentBreakevenPoint ? "text-green-700 dark:text-green-300" : ""}`}>The Investment Breakeven Point</h4>
                            <p className="text-sm mt-1 text-muted-foreground">
                                {investmentBreakevenPoint
                                    ? `In Year ${investmentBreakevenPoint}, the profit from selling your home would be enough to cover all your ownership costs.`
                                    : `Within your ${stayDuration}-year timeline, you would not reach a point where selling the home covers all your expenses.`
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      <QualitativeFactors />
    </div>
  );
}

    