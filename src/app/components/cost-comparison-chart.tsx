
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
      // The payload contains all items in the stack. We need to check if we are on the 'buy' stack.
      // We can do this by checking if a key like 'principal' exists in the payload names.
      const payloadKeys = payload.map((p: any) => p.dataKey);
      const isBuyingStack = payloadKeys.some((key: string) => ['principal', 'interest', 'maintenance', 'ewf'].includes(key));
      
      const data = payload[0].payload;

      if (isBuyingStack) {
        const totalBuyingGross = data.principal + data.interest + data.maintenance + data.ewf;
        const taxBenefit = data.taxBenefit;
        const totalNet = totalBuyingGross - taxBenefit;
        
        return (
          <div className="p-3 bg-card border rounded-lg shadow-lg max-w-sm">
            <h4 className="font-bold text-base mb-2">Buying Cost Breakdown</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Principal (Equity):</span> <span className="font-medium">{formatCurrency(data.principal)}</span></div>
              <div className="flex justify-between"><span>Interest Cost:</span> <span className="font-medium">{formatCurrency(data.interest)}</span></div>
              <div className="flex justify-between"><span>Maintenance:</span> <span className="font-medium">{formatCurrency(data.maintenance)}</span></div>
              <div className="flex justify-between"><span>EWF Tax:</span> <span className="font-medium">{formatCurrency(data.ewf)}</span></div>
            </div>
            <div className="border-t my-2"></div>
            <div className="flex justify-between text-sm"><strong>Gross Monthly Cost:</strong> <strong className="font-bold">{formatCurrency(totalBuyingGross)}</strong></div>
            <div className="flex justify-between text-sm text-green-600"><span>Tax Benefit:</span> <span>-{formatCurrency(taxBenefit)}</span></div>
            <div className="border-t my-2"></div>
            <div className="flex justify-between font-bold text-base"><strong>Net Monthly Cost:</strong> <strong>{formatCurrency(totalNet)}</strong></div>
          </div>
        );

      } else { // It's the rent bar
        const rentValue = data.rent;
        return (
            <div className="p-3 bg-card border rounded-lg shadow-lg max-w-xs">
                <p className="font-bold text-base mb-1">{chartConfig.rent.label}: {formatCurrency(rentValue)}</p>
                <p className="text-sm text-muted-foreground">Your monthly rent after any subsidies.</p>
            </div>
        );
      }
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
          allowEscapeViewBox={{ x: true, y: true }}
          wrapperStyle={{ zIndex: 100 }}
        />
        <Legend />
        
        {/* Rent Bar */}
        <Bar dataKey="rent" name="Net Rent" fill="var(--color-rent)" radius={4} stackId="rent" />

        {/* Buying Bar - Stacked */}
        <Bar dataKey="principal" name="Principal (Equity)" fill="var(--color-principal)" radius={[4, 4, 0, 0]} stackId="buy" />
        <Bar dataKey="interest" name="Interest Cost" fill="var(--color-interest)" stackId="buy" />
        <Bar dataKey="maintenance" name="Maintenance" fill="var(--color-maintenance)" stackId="buy" />
        <Bar dataKey="ewf" name="EWF Tax" fill="var(--color-ewf)" radius={[0, 0, 0, 0]} stackId="buy" />

      </BarChart>
    </ChartContainer>
  )
}
