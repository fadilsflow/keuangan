"use client"

import { Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ChartWrapper } from "@/components/ui/chart-wrapper"
import { formatRupiah } from "@/lib/utils"

// Default colors for chart segments
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface CustomPieChartProps {
  title: string
  description?: string
  data: any[]
  chartConfig: ChartConfig
  nameKey: string
  dataKey: string
  height?: number
  showPercentLabels?: boolean
}

export function CustomPieChart({
  title,
  description,
  data,
  chartConfig,
  nameKey,
  dataKey,
  height = 400,
  showPercentLabels = true,
}: CustomPieChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartWrapper height={height}>
          <ChartContainer config={chartConfig}>
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <ChartTooltip
                content={<ChartTooltipContent 
                  nameKey={nameKey}
                  formatter={(value) => formatRupiah(Number(value))}
                />}
              />
              <Pie
                data={data}
                dataKey={dataKey}
                nameKey={nameKey}
                cx="50%"
                cy="50%"
                outerRadius={150}
                innerRadius={60}
                labelLine={false}
                label={showPercentLabels ? 
                  ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` : 
                  undefined
                }
              >
                {data.map((entry, index) => {
                  const key = entry[nameKey]?.toString().toLowerCase().replace(/\s+/g, '-');
                  const color = key && chartConfig[key]?.color
                    ? chartConfig[key].color
                    : COLORS[index % COLORS.length];
                  
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={color}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ChartContainer>
        </ChartWrapper>
      </CardContent>
    </Card>
  )
} 