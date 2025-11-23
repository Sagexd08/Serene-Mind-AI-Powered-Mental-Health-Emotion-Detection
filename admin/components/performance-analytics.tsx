"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Activity } from "lucide-react"

const systemMetrics = [
  { metric: "Average Response Time", value: "45ms", target: "< 100ms", status: "good", progress: 55 },
  { metric: "System Uptime", value: "99.2%", target: "> 99%", status: "excellent", progress: 99 },
  { metric: "Network Latency", value: "12ms", target: "< 50ms", status: "excellent", progress: 76 },
  { metric: "Error Rate", value: "0.3%", target: "< 1%", status: "good", progress: 70 },
  { metric: "CPU Utilization", value: "34%", target: "< 80%", status: "good", progress: 43 },
  { metric: "Memory Usage", value: "67%", target: "< 85%", status: "warning", progress: 79 },
]

const performanceHistory = [
  { time: "00:00", responseTime: 42, uptime: 99.8, errorRate: 0.2 },
  { time: "04:00", responseTime: 38, uptime: 99.9, errorRate: 0.1 },
  { time: "08:00", responseTime: 52, uptime: 99.5, errorRate: 0.4 },
  { time: "12:00", responseTime: 67, uptime: 99.2, errorRate: 0.6 },
  { time: "16:00", responseTime: 45, uptime: 99.7, errorRate: 0.3 },
  { time: "20:00", responseTime: 41, uptime: 99.8, errorRate: 0.2 },
]

const mirrorPerformance = [
  { mirror: "MIR-001", uptime: 99.8, responseTime: 42, errors: 2 },
  { mirror: "MIR-002", uptime: 98.5, responseTime: 38, errors: 5 },
  { mirror: "MIR-003", uptime: 97.2, responseTime: 51, errors: 8 },
  { mirror: "MIR-004", uptime: 85.3, responseTime: 0, errors: 45 },
  { mirror: "MIR-005", uptime: 99.1, responseTime: 35, errors: 3 },
  { mirror: "MIR-006", uptime: 94.7, responseTime: 89, errors: 12 },
]

const resourceUsage = [
  { hour: "00:00", cpu: 25, memory: 45, storage: 67, network: 12 },
  { hour: "04:00", cpu: 18, memory: 42, storage: 67, network: 8 },
  { hour: "08:00", cpu: 45, memory: 58, storage: 68, network: 25 },
  { hour: "12:00", cpu: 67, memory: 72, storage: 69, network: 45 },
  { hour: "16:00", cpu: 52, memory: 65, storage: 70, network: 32 },
  { hour: "20:00", cpu: 34, memory: 51, storage: 71, network: 18 },
]

export function PerformanceAnalytics() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
      case "good":
        return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
      case "warning":
        return (
          <Badge variant="outline" className="border-yellow-200 text-yellow-800">
            Warning
          </Badge>
        )
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500"
      case "good":
        return "bg-blue-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators and targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemMetrics.map((metric) => (
                <div key={metric.metric} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{metric.value}</span>
                      {getStatusBadge(metric.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={metric.progress} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground">{metric.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance History</CardTitle>
            <CardDescription>24-hour performance trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceHistory}>
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
                  dataKey="responseTime"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name="Response Time (ms)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="uptime"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Uptime (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
            <CardDescription>System resource usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resourceUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="cpu" fill="hsl(var(--chart-1))" name="CPU %" />
                <Bar dataKey="memory" fill="hsl(var(--chart-2))" name="Memory %" />
                <Bar dataKey="storage" fill="hsl(var(--chart-3))" name="Storage %" />
                <Bar dataKey="network" fill="hsl(var(--chart-4))" name="Network %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mirror Performance Ranking</CardTitle>
            <CardDescription>Individual mirror performance comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mirrorPerformance
                .sort((a, b) => b.uptime - a.uptime)
                .map((mirror) => (
                  <div key={mirror.mirror} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{mirror.mirror}</div>
                        <div className="text-sm text-muted-foreground">
                          {mirror.responseTime > 0 ? `${mirror.responseTime}ms response` : "Offline"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{mirror.uptime}%</div>
                      <div className="text-sm text-muted-foreground">
                        {mirror.errors} error{mirror.errors !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
