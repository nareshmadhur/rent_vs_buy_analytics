
"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, AreaChart } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"
import type { YearlyProjection } from "@/lib/calculations"

const chartConfig = {
  cumulativeBuyingCost: {
    label: "Total Buying Costs",
    color: "hsl(var(--chart-5))",
  },
  cumulativeRentingCost: {
    label: "Total Renting Costs",
    color: "hsl(var(--chart-2))",
  },
  accumulatedEquity: {
    label: "Accumulated Equity",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

interface ProjectionChartProps {
  data: YearlyProjection[];
}

export default function ProjectionChart({ data }: ProjectionChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `Year ${value}`}
        />
        <YAxis
          tickFormatter={(value) => formatCurrency(value as number, 'EUR').replace('€', '').replace(',00', '') + 'k'}
           tickLine={false}
           axisLine={false}
           tickMargin={8}
           domain={['dataMin', 'dataMax']}
           // transform original value to be in thousands
            tickTransformer={(value) => value / 1000}
        />
        <Tooltip
          content={<ChartTooltipContent
            formatter={(value, name) => {
                 if (name === 'accumulatedEquity') return `${formatCurrency(value as number)} (Asset)`
                 return `${formatCurrency(value as number)} (Cost)`
            }}
            indicator="dot"
            labelFormatter={(label) => `Year ${label}`}
          />}
        />
        <Legend content={<CustomLegend />} />
        <Area
          dataKey="accumulatedEquity"
          type="natural"
          fill="var(--color-accumulatedEquity)"
          fillOpacity={0.4}
          stroke="var(--color-accumulatedEquity)"
          stackId="1"
        />
         <Area
          dataKey="cumulativeBuyingCost"
          type="natural"
          fill="var(--color-cumulativeBuyingCost)"
          fillOpacity={0.4}
          stroke="var(--color-cumulativeBuyingCost)"
          stackId="2"
        />
        <Area
          dataKey="cumulativeRentingCost"
          type="natural"
          fill="var(--color-cumulativeRentingCost)"
          fillOpacity={0.4}
          stroke="var(--color-cumulativeRentingCost)"
          stackId="3"
        />
      </AreaChart>
    </ChartContainer>
  )
}

const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
};
