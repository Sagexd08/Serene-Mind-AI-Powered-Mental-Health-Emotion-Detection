import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Monitor, Wifi, Activity, Zap, AlertTriangle, CheckCircle } from "lucide-react"

interface MirrorStatsProps {
  totalMirrors: number;
  onlineMirrors: number;
  offlineMirrors: number;
  activeDetections: number;
}

export function MirrorStats({ totalMirrors, onlineMirrors, offlineMirrors, activeDetections }: MirrorStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Mirrors</CardTitle>
          <Monitor className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMirrors}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              {onlineMirrors} Online
            </Badge>
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {offlineMirrors} Offline
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Network Health</CardTitle>
          <Wifi className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">98.5%</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+0.2%</span> from last hour
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">45ms</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">-3ms</span> improvement
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Detections</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeDetections.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Faces detected today</p>
        </CardContent>
      </Card>
    </div>
  )
}