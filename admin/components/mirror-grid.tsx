"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MirrorDetails } from "@/components/mirror-details"
import {
  Monitor,
  Wifi,
  Activity,
  Eye,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  WifiOff,
  Settings,
} from "lucide-react"
import { MirrorType } from "@/context/global-context-type"

interface MirrorGridProps {
  mirrors: MirrorType[];
}

export function MirrorGrid({ mirrors }: MirrorGridProps) {
  const [selectedMirror, setSelectedMirror] = useState<string | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "offline":
        return <WifiOff className="w-4 h-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <Monitor className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-100 text-green-800">Online</Badge>
      case "offline":
        return <Badge variant="destructive">Offline</Badge>
      case "warning":
        return (
          <Badge variant="outline" className="border-yellow-200 text-yellow-800">
            Warning
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getPerformanceColor = (value: number, type: string) => {
    if (type === "uptime") {
      if (value >= 98) return "text-green-600"
      if (value >= 95) return "text-yellow-600"
      return "text-red-600"
    }
    if (type === "usage") {
      if (value >= 80) return "text-red-600"
      if (value >= 60) return "text-yellow-600"
      return "text-green-600"
    }
    return "text-foreground"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {mirrors.map((mirror) => (
        <Card key={mirror.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(mirror.status)}
                <CardTitle className="text-base">{mirror.id}</CardTitle>
              </div>
              {getStatusBadge(mirror.status)}
            </div>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {mirror.location}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  <span>Faces Today</span>
                </div>
                <div className="font-semibold">{mirror.totalFaceDetected}</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Activity className="w-3 h-3" />
                  <span>Sentiment</span>
                </div>
                <div className="font-semibold">{mirror.status === "offline" ? "N/A" : `${mirror.sentiment}/10`}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uptime</span>
                <span className={`font-medium ${getPerformanceColor(mirror.uptime, "uptime")}`}>{mirror.uptime}%</span>
              </div>
              <Progress value={mirror.uptime} className="h-1" />
            </div>

            {mirror.status !== "offline" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">CPU Usage</span>
                  <span className={`font-medium ${getPerformanceColor(mirror.cpuUsage, "usage")}`}>
                    {mirror.cpuUsage}%
                  </span>
                </div>
                <Progress value={mirror.cpuUsage} className="h-1" />
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{mirror.lastUpdate}</span>
              </div>
              {mirror.status !== "offline" && (
                <div className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  <span>{mirror.responseTime}ms</span>
                </div>
              )}
            </div>

            <Dialog >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Settings className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className=" flex flex-col justify-center items-center" style={{ width: '90vw', maxWidth: '1200px', minHeight: '800px' }}>
                <DialogHeader>
                  <DialogTitle>{mirror.name}</DialogTitle>
                  <DialogDescription>Detailed mirror information and controls</DialogDescription>
                </DialogHeader>
                <MirrorDetails mirror={mirror} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}