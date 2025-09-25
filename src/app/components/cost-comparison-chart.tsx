
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

const chartConfig = {
  rent: {
    label: "Renting",
    color: "hsl(var(--chart-2))",
  },
  principal: {
    label: "Principal (Equity)",
    color: "hsl(var(--chart-3))",
  },
  interest: {
    label: "Interest",
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
      color: "hsl(var(--color-chart-3))"
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
      // The total net cost of buying for tooltip purposes
      netBuyingCost: buyingCostBreakdown.principal + buyingCostBreakdown.interest + buyingCostBreakdown.maintenance + buyingCostBreakdown.ewf - buyingCostBreakdown.taxBenefit
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
          cursor={false}
          content={<ChartTooltipContent
            formatter={(value, name, props) => {
                if (name === 'rent') return `${formatCurrency(value as number)} - Net Rent`
                if (name === 'netBuyingCost') return `${formatCurrency(value as number)} - Net Buy`
                if (name === 'taxBenefit') return `-${formatCurrency(value as number)} (Benefit)`
                return formatCurrency(value as number)
            }}
            indicator="dot"
            payload={// Custom payload to show totals
                [
                    {name: 'rent', value: chartData[0].rent, color: chartConfig.rent.color},
                    {name: 'netBuyingCost', value: chartData[0].netBuyingCost, color: chartConfig.interest.color},
                ]
            }
          />}
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
