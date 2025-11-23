"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, Calendar } from "lucide-react"

const monthlyTrends = [
  { month: "Jan", interactions: 18456, sentiment: 7.2, uniqueVisitors: 8234 },
  { month: "Feb", interactions: 21234, sentiment: 7.5, uniqueVisitors: 9456 },
  { month: "Mar", interactions: 19876, sentiment: 7.1, uniqueVisitors: 8967 },
  { month: "Apr", interactions: 23456, sentiment: 7.8, uniqueVisitors: 10234 },
  { month: "May", interactions: 25678, sentiment: 8.0, uniqueVisitors: 11456 },
  { month: "Jun", interactions: 24567, sentiment: 7.9, uniqueVisitors: 10987 },
  { month: "Jul", interactions: 26789, sentiment: 8.2, uniqueVisitors: 12345 },
]

const weeklyPatterns = [
  { day: "Monday", morning: 234, afternoon: 456, evening: 123 },
  { day: "Tuesday", morning: 267, afternoon: 523, evening: 145 },
  { day: "Wednesday", morning: 289, afternoon: 567, evening: 167 },
  { day: "Thursday", morning: 245, afternoon: 489, evening: 134 },
  { day: "Friday", morning: 312, afternoon: 678, evening: 189 },
  { day: "Saturday", morning: 189, afternoon: 345, evening: 234 },
  { day: "Sunday", morning: 156, afternoon: 289, evening: 198 },
]

const seasonalData = [
  { period: "Q1 2023", interactions: 59566, sentiment: 7.3, growth: 5.2 },
  { period: "Q2 2023", interactions: 73701, sentiment: 7.9, growth: 23.7 },
  { period: "Q3 2023", interactions: 78034, sentiment: 8.1, growth: 5.9 },
  { period: "Q4 2023", interactions: 82456, sentiment: 7.8, growth: 5.7 },
  { period: "Q1 2024", interactions: 87234, sentiment: 8.0, growth: 5.8 },
]

const predictiveData = [
  { month: "Aug", actual: 26789, predicted: null },
  { month: "Sep", actual: null, predicted: 28456 },
  { month: "Oct", actual: null, predicted: 29234 },
  { month: "Nov", actual: null, predicted: 30567 },
  { month: "Dec", actual: null, predicted: 32123 },
]

export function TrendAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Interactions and sentiment over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
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
                  dataKey="interactions"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name="Interactions"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sentiment"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Sentiment"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity Patterns</CardTitle>
            <CardDescription>Activity distribution throughout the week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyPatterns}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="morning"
                  stackId="1"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  name="Morning"
                />
                <Area
                  type="monotone"
                  dataKey="afternoon"
                  stackId="1"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  name="Afternoon"
                />
                <Area
                  type="monotone"
                  dataKey="evening"
                  stackId="1"
                  stroke="hsl(var(--chart-3))"
                  fill="hsl(var(--chart-3))"
                  name="Evening"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Analysis</CardTitle>
            <CardDescription>Quarterly performance and growth trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {seasonalData.map((period) => (
                <div key={period.period} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{period.period}</div>
                      <div className="text-sm text-muted-foreground">
                        {period.interactions.toLocaleString()} interactions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="font-semibold text-green-600">+{period.growth}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{period.sentiment}/10 sentiment</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predictive Analytics</CardTitle>
            <CardDescription>Forecasted interaction volumes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={[...monthlyTrends.slice(-1), ...predictiveData]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="interactions"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name="Actual"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Growth Forecast</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Predicted 20% increase in interactions over the next 4 months based on current trends
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
