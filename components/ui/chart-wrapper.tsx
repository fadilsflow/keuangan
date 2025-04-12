"use client"

import { cn } from "@/lib/utils"
import { ResponsiveContainer } from "recharts"

interface ChartWrapperProps {
  children: React.ReactNode
  className?: string
  height?: number | string
}

export function ChartWrapper({
  children,
  className,
  height = 400,
}: ChartWrapperProps) {
  return (
    <div
      className={cn(
        "w-full rounded-lg", 
        className
      )}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={300}>
        {children}
      </ResponsiveContainer>
    </div>
  )
} 