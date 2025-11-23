"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  Monitor,
  Wifi,
  Activity,
  Eye,
  MapPin,
  Clock,
  Thermometer,
  Cpu,
  HardDrive,
  MemoryStick,
  Power,
  RefreshCw,
  Settings,
} from "lucide-react"
import { MirrorType } from "@/context/global-context-type"

interface MirrorDetailsProps {
  mirror: MirrorType
}

const performanceData = [
  { time: "00:00", cpu: 15, memory: 32, faces: 0 },
  { time: "04:00", cpu: 12, memory: 28, faces: 2 },
  { time: "08:00", cpu: 25, memory: 45, faces: 12 },
  { time: "12:00", cpu: 35, memory: 52, faces: 23 },
  { time: "16:00", cpu: 28, memory: 48, faces: 18 },
  { time: "20:00", cpu: 22, memory: 41, faces: 8 },
]

const emotionData = [
  { time: "00:00", happy: 2, neutral: 1, sad: 0, surprised: 0, angry: 0 },
  { time: "04:00", happy: 1, neutral: 1, sad: 0, surprised: 0, angry: 0 },
  { time: "08:00", happy: 8, neutral: 3, sad: 1, surprised: 0, angry: 0 },
  { time: "12:00", happy: 15, neutral: 6, sad: 1, surprised: 1, angry: 0 },
  { time: "16:00", happy: 12, neutral: 4, sad: 1, surprised: 1, angry: 0 },
  { time: "20:00", happy: 5, neutral: 2, sad: 1, surprised: 0, angry: 0 },
]

export function MirrorDetails({ mirror }: MirrorDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600"
      case "offline":
        return "text-red-600"
      case "warning":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const getUsageColor = (value: number) => {
    if (value >= 80) return "text-red-600"
    if (value >= 60) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="space-y-6 w-max">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-semibold capitalize ${getStatusColor(mirror.status)}`}>{mirror.status}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              Last seen: {mirror.lastUpdate}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{mirror.location}</div>
            <div className="text-sm text-muted-foreground mt-1">Mirror ID: {mirror.id}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{mirror.uptime}% Uptime</div>
            <div className="text-sm text-muted-foreground mt-1">{mirror.responseTime}ms response time</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="emotions">Emotions</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Faces Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mirror.totalFaceDetected}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Current Emotion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mirror.emotion}</div>
                <div className="text-sm text-muted-foreground">
                  {mirror.sentiment > 0 ? `${mirror.sentiment}/10 sentiment` : "No data"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  Temperature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mirror.status === "offline" ? "N/A" : `${mirror.avgBodyTemperature}°F`}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mirror.status === "offline" ? "N/A" : `${mirror.responseTime}ms`}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-lg font-bold ${getUsageColor(mirror.cpuUsage)}`}>{mirror.cpuUsage}%</span>
                </div>
                <Progress value={mirror.cpuUsage} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MemoryStick className="w-4 h-4" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-lg font-bold ${getUsageColor(mirror.memoryUsage)}`}>
                    {mirror.memoryUsage}%
                  </span>
                </div>
                <Progress value={mirror.memoryUsage} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Storage Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-lg font-bold ${getUsageColor(mirror.storageUsage)}`}>
                    {mirror.storageUsage}%
                  </span>
                </div>
                <Progress value={mirror.storageUsage} className="h-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics (24h)</CardTitle>
              <CardDescription>CPU, Memory usage and face detection activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="cpu" stroke="hsl(var(--chart-1))" strokeWidth={2} name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Memory %" />
                  <Line
                    type="monotone"
                    dataKey="faces"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    name="Faces/hour"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emotions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emotion Detection Timeline (24h)</CardTitle>
              <CardDescription>Breakdown of detected emotions throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={emotionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="happy" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Happy" />
                  <Line type="monotone" dataKey="neutral" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Neutral" />
                  <Line
                    type="monotone"
                    dataKey="surprised"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    name="Surprised"
                  />
                  <Line type="monotone" dataKey="sad" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Sad" />
                  <Line type="monotone" dataKey="angry" stroke="hsl(var(--chart-5))" strokeWidth={2} name="Angry" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Controls</CardTitle>
                <CardDescription>Manage mirror operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" disabled={mirror.status === "offline"}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restart Mirror
                </Button>
                <Button variant="outline" className="w-full bg-transparent" disabled={mirror.status === "offline"}>
                  <Settings className="w-4 h-4 mr-2" />
                  Update Configuration
                </Button>
                <Button variant="destructive" className="w-full">
                  <Power className="w-4 h-4 mr-2" />
                  {mirror.status === "offline" ? "Power On" : "Power Off"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Diagnostics</CardTitle>
                <CardDescription>System health checks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent">
                  Run Network Test
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Check Camera Feed
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Download Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}