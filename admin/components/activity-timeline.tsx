"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const timelineData = [
  { time: "00:00", faces: 12, sentiment: 7.2 },
  { time: "04:00", faces: 8, sentiment: 6.8 },
  { time: "08:00", faces: 45, sentiment: 7.8 },
  { time: "12:00", faces: 89, sentiment: 8.1 },
  { time: "16:00", faces: 67, sentiment: 7.5 },
  { time: "20:00", faces: 34, sentiment: 7.9 },
]

export function ActivityTimeline() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={timelineData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
        <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="faces"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--chart-1))" }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="sentiment"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--chart-2))" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
