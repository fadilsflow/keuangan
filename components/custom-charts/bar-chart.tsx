"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { format } from "date-fns"
import { id } from "date-fns/locale"

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

interface CustomBarChartProps {
  title: string
  description?: string
  data: any[]
  chartConfig: ChartConfig
  xAxisDataKey: string
  xAxisFormatter?: (value: any) => string
  showLabels?: boolean
  barKeys: string[]
  height?: number
  isMonthly?: boolean
}

export function CustomBarChart({
  title,
  description,
  data,
  chartConfig,
  xAxisDataKey,
  xAxisFormatter,
  showLabels = false,
  barKeys,
  height = 400,
  isMonthly = false,
}: CustomBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartWrapper height={height}>
          <ChartContainer config={chartConfig}>
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 70,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey={xAxisDataKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={70}
                tickFormatter={
                  xAxisFormatter || 
                  (isMonthly
                    ? (value) => format(new Date(2021, value - 1), "MMMM", { locale: id })
                    : undefined)
                }
              />
              <YAxis 
                tickFormatter={(value) => formatRupiah(value)} 
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent 
                    formatter={(value) => formatRupiah(Number(value))}
                    labelFormatter={(label) => {
                      if (isMonthly) {
                        // Safely handle month formatting
                        try {
                          const monthNum = Number(label);
                          if (isNaN(monthNum)) return String(label);
                          return format(new Date(2021, monthNum - 1), "MMMM", { locale: id });
                        } catch (e) {
                          return String(label);
                        }
                      }
                      return String(label);
                    }}
                  />
                }
              />
              <Legend />
              
              {barKeys.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={`var(--color-${key})`} 
                  radius={4}
                >
                  {showLabels && (
                    <LabelList
                      dataKey={key}
                      position="top"
                      formatter={(value: number) => formatRupiah(value)}
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ChartContainer>
        </ChartWrapper>
      </CardContent>
    </Card>
  )
} 