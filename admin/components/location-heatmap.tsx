"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import { useGlobalContext } from "@/context/global-context-manager"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

export function LocationHeatmap() {
  const { locations } = useGlobalContext()

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case "high":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "partial":
        return "bg-yellow-500"
      case "offline":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Fallback: show “Add Location” if no locations exist
  if (!locations || locations.length === 0) {
    return (
      <div className="flex justify-center items-center h-60">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
              <p className="text-sm text-muted-foreground">Create a new location to deploy smart mirrors.</p>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" placeholder="Main Lobby" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input id="description" placeholder="Primary entrance area" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">Capacity</Label>
                <Input id="capacity" type="number" placeholder="100" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Location</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {locations.map((location) => (
        <Card key={location.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">{location.place}</CardTitle>
              </div>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(location.description)}`} />
            </div>
            <CardDescription>
              {location.mirrorCount} mirror{location.mirrorCount !== 1 ? "s" : ""} deployed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Faces Today</span>
              <span className="font-semibold">
                {location.mirrors.map(m => m.totalFaceDetected).reduce((a, b) => a + b, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Engagement</span>
              <Badge variant="outline" className={getEngagementColor(
                location.mirrors.map(m => m.totalFaceDetected).reduce((a, b) => a + b, 0) > 100
                  ? 'high'
                  : location.mirrors.map(m => m.totalFaceDetected).reduce((a, b) => a + b, 0) > 50
                    ? 'medium'
                    : 'low'
              )}>
                {location.mirrors.map(m => m.totalFaceDetected).reduce((a, b) => a + b, 0) > 100
                  ? 'High'
                  : location.mirrors.map(m => m.totalFaceDetected).reduce((a, b) => a + b, 0) > 50
                    ? 'Medium'
                    : 'Low'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
