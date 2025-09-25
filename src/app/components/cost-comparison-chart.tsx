
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

const chartConfig = {
  rent: {
    label: "Net Rent",
    color: "hsl(var(--chart-2))",
  },
  principal: {
    label: "Principal (Equity)",
    color: "hsl(var(--chart-3))",
  },
  interest: {
    label: "Interest Cost",
    color: "hsl(var(--chart-1))",
  },
  maintenance: {
    label: "Maintenance",
    color: "hsl(var(--chart-4))",
  },
  ewf: {
    label: "EWF Tax",
    color: "hsl(var(--chart-5))",
  },
  taxBenefit: {
      label: "Tax Benefit",
      color: "hsl(var(--chart-3))"
  }
} satisfies ChartConfig

interface CostComparisonChartProps {
  rentingCost: number;
  buyingCostBreakdown: {
    principal: number;
    interest: number;
    maintenance: number;
    ewf: number;
    taxBenefit: number;
  };
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const { dataKey, value } = data; // Changed from 'name' to 'dataKey'
      const name = dataKey as keyof typeof chartConfig;

      let description = '';

      switch(name) {
        case 'rent': description = 'Your monthly rent after any subsidies.'; break;
        case 'principal': description = 'The part of your payment that builds home equity.'; break;
        case 'interest': description = 'The cost of borrowing, before tax deductions.'; break;
        case 'maintenance': description = 'Estimated monthly cost for upkeep.'; break;
        case 'ewf': description = 'The notional rental value tax you pay as a homeowner.'; break;
        default: description = 'A component of your housing cost.';
      }
      
      const isBuyingSegment = data.payload.stackId === 'buy';
      
      const totalBuyingCost = isBuyingSegment ? payload.reduce((acc: number, entry: any) => {
        if(entry.payload.stackId === 'buy') {
            return acc + (entry.value || 0);
        }
        return acc;
      }, 0) : 0;
      
      // We need to calculate total from original data, not from whatever is in the tooltip payload
      const fullPayload = payload[0].payload;
      const totalBuyingGross = fullPayload.principal + fullPayload.interest + fullPayload.maintenance + fullPayload.ewf;
      const taxBenefit = fullPayload.taxBenefit;


      return (
        <div className="p-3 bg-card border rounded-lg shadow-lg max-w-xs">
          <p className="font-bold text-base mb-1">{chartConfig[name]?.label}: {formatCurrency(value)}</p>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          {isBuyingSegment && (
             <div className="border-t pt-2 mt-2">
                <p className="text-xs">
                    The total gross monthly buying cost is <span className="font-bold">{formatCurrency(totalBuyingGross)}</span>.
                    After a tax benefit of <span className="font-bold text-green-600">-{formatCurrency(taxBenefit)}</span>, the net cost is <span className="font-bold">{formatCurrency(totalBuyingGross - taxBenefit)}</span>.
                </p>
             </div>
          )}
        </div>
      );
    }
  
    return null;
  };

export default function CostComparisonChart({ rentingCost, buyingCostBreakdown }: CostComparisonChartProps) {
  const chartData = [
    {
      label: "Monthly Cost",
      rent: rentingCost,
      principal: buyingCostBreakdown.principal,
      interest: buyingCostBreakdown.interest,
      maintenance: buyingCostBreakdown.maintenance,
      ewf: buyingCostBreakdown.ewf,
      taxBenefit: buyingCostBreakdown.taxBenefit,
    },
  ]

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart accessibilityLayer data={chartData} barSize={80} >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(value) => formatCurrency(value as number)}
          tickLine={false}
          axisLine={false}
          tickMargin={10}
        />
        <Tooltip
          cursor={{ fill: 'hsla(var(--muted-foreground), 0.1)' }}
          content={<CustomTooltip />}
        />
        <Legend />
        
        {/* Rent Bar */}
        <Bar dataKey="rent" fill="var(--color-rent)" radius={4} stackId="rent" />

        {/* Buying Bar - Stacked */}
        <Bar dataKey="principal" fill="var(--color-principal)" radius={[4, 4, 0, 0]} stackId="buy" />
        <Bar dataKey="interest" fill="var(--color-interest)" stackId="buy" />
        <Bar dataKey="maintenance" fill="var(--color-maintenance)" stackId="buy" />
        <Bar dataKey="ewf" fill="var(--color-ewf)" radius={[0, 0, 0, 0]} stackId="buy" />

      </BarChart>
    </ChartContainer>
  )
}
