"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

const chartConfig = {
  renting: {
    label: "Renting",
    color: "hsl(var(--chart-2))",
  },
  buying: {
    label: "Buying",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface CostComparisonChartProps {
  rentingCost: number;
  buyingCost: number;
}

export default function CostComparisonChart({ rentingCost, buyingCost }: CostComparisonChartProps) {
  const chartData = [
    {
      label: "Monthly Cost",
      renting: rentingCost,
      buying: buyingCost,
    },
  ]

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <BarChart accessibilityLayer data={chartData} barSize={60}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
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
            formatter={(value) => formatCurrency(value as number)}
            indicator="dot"
          />}
        />
        <Bar dataKey="renting" fill="var(--color-renting)" radius={4} />
        <Bar dataKey="buying" fill="var(--color-buying)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
