
"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, AreaChart, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"
import type { YearlyProjection } from "@/lib/calculations"

const chartConfig = {
  // C4.0 - Cumulative Cash Outflow for Buying
  cumulativeBuyingCost: {
    label: "Total Buying Outlay",
    color: "hsl(var(--chart-5))",
  },
  // C4.0 - Cumulative Cash Outflow for Renting
  cumulativeRentingCost: {
    label: "Total Renting Outlay",
    color: "hsl(var(--chart-2))",
  },
  // C8.0 & C9.0 - True Net Cost of Ownership (TNO)
  totalNetOwnershipCost: {
    label: "True Cost of Owning (after sale)",
    color: "hsl(var(--chart-3))"
  }
} satisfies ChartConfig

interface ProjectionChartProps {
  data: YearlyProjection[];
  breakevenYear: number | null;
}

export default function ProjectionChart({ data, breakevenYear }: ProjectionChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 20,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `Yr ${value}`}
        />
        <YAxis
          tickFormatter={(value) => formatCurrency(value as number, 'EUR').replace('€', '').replace(',00', '') + 'k'}
           tickLine={false}
           axisLine={false}
           tickMargin={8}
           domain={['auto', 'auto']}
           // transform original value to be in thousands
            tickTransformer={(value) => value / 1000}
        />
        <Tooltip
          content={<CustomTooltipContent />}
        />
        <Legend content={<CustomLegend />} />

        {breakevenYear && (
          <ReferenceLine
            x={breakevenYear}
            stroke="hsl(var(--primary))"
            strokeDasharray="3 3"
            strokeWidth={2}
          >
            <ReferenceLine.Label
              value="Breakeven"
              position="insideTop"
              fill="hsl(var(--primary))"
              fontSize={12}
              offset={10}
            />
          </ReferenceLine>
        )}

        {/* This represents the "true" cost of ownership after realizing the asset */}
        <Area
          dataKey="totalNetOwnershipCost"
          type="natural"
          fill="var(--color-totalNetOwnershipCost)"
          fillOpacity={0.2}
          stroke="var(--color-totalNetOwnershipCost)"
          stackId="1"
          strokeWidth={2}
        />
         <Area
          dataKey="cumulativeBuyingCost"
          type="natural"
          fill="var(--color-cumulativeBuyingCost)"
          fillOpacity={0.4}
          stroke="var(--color-cumulativeBuyingCost)"
          stackId="2"
          strokeWidth={2}
        />
        <Area
          dataKey="cumulativeRentingCost"
          type="natural"
          fill="var(--color-cumulativeRentingCost)"
          fillOpacity={0.4}
          stroke="var(--color-cumulativeRentingCost)"
          stackId="3"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}

const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
};

const CustomTooltipContent = (props: any) => {
    const { active, payload, label } = props;
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    // Sort payload to match legend order if necessary
    const orderedPayload = payload.sort((a: any, b: any) => {
        const order = ['Total Buying Outlay', 'Total Renting Outlay', 'True Cost of Owning (after sale)'];
        return order.indexOf(a.name) - order.indexOf(b.name);
    });

    return (
      <div className="p-4 bg-card border rounded-lg shadow-lg">
        <p className="font-bold mb-2">{`Year ${label}`}</p>
        {orderedPayload.map((p: any, i: number) => (
           <div key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-sm text-muted-foreground min-w-[150px]">{p.name}:</span>
                <span className="text-sm font-bold ml-auto">{formatCurrency(p.value)}</span>
           </div>
        ))}
      </div>
    );
};
