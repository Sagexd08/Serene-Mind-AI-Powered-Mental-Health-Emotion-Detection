"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmotionChart } from "@/components/emotion-chart"
import { ActivityTimeline } from "@/components/activity-timeline"
import { LocationHeatmap } from "@/components/location-heatmap"
import { Computer as MirrorIcon, Smile, Eye } from "lucide-react"
import { useEffect } from "react"

export default function DashboardPage() {
  // --- Mock Data ---
  const mirrors = [
    { id: 1, cpuUsage: 25, totalFaceDetected: 12 },
    { id: 2, cpuUsage: 0, totalFaceDetected: 0 },
    { id: 3, cpuUsage: 60, totalFaceDetected: 20 },
    { id: 4, cpuUsage: 15, totalFaceDetected: 8 },
  ]

  const topEmotion = "Happy"
  const topEmotionPercentage = 47


  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/mirror")
      const data = await res.json()
      console.log(data)
    }

    fetchData()
  }, [])

  // --- UI ---
  return (
    <DashboardLayout currentPage="Overview">
      <div className="space-y-6">
        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mirrors</CardTitle>
              <MirrorIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mirrors.length}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {mirrors.filter(m => m.cpuUsage > 0).length} Online
                </Badge>
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  {mirrors.filter(m => m.cpuUsage === 0).length} Offline
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faces Detected Today</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mirrors.reduce((acc, m) => acc + m.totalFaceDetected, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Emotion</CardTitle>
              <Smile className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topEmotion}</div>
              <p className="text-xs text-muted-foreground">
                {topEmotionPercentage}% of all detections
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Emotion Distribution</CardTitle>
              <CardDescription>Today's emotion breakdown across all mirrors</CardDescription>
            </CardHeader>
            <CardContent>
              <EmotionChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Face detection and sentiment trends over 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityTimeline />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Location Heatmap</CardTitle>
            <CardDescription>Real-time sentiment and engagement across all locations</CardDescription>
          </CardHeader>
          <CardContent>
            <LocationHeatmap />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
