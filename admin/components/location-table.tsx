"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { MoreHorizontal, Edit, Trash2, Settings, MapPin, Monitor, Eye } from "lucide-react"
import { LocationType } from "@/context/global-context-type"

interface LocationTableProps {
  locations: LocationType[]
}

export function LocationTable({ locations }: LocationTableProps) {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "warning":
        return (
          <Badge variant="outline" className="border-yellow-200 text-yellow-800">
            Warning
          </Badge>
        )
      case "offline":
        return <Badge variant="destructive">Offline</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 80) return "text-red-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Location</TableHead>
            <TableHead>Mirrors</TableHead>
            <TableHead>Occupancy</TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead>Faces Today</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Update</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => {
            const occupancyPercentage = Math.round((location.currentOccupancy / location.capacity) * 100)
            return (
              <TableRow key={location.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{location.name}</div>
                      <div className="text-sm text-muted-foreground">{location.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {location.onlineMirrors}/{location.mirrorCount}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={getOccupancyColor(occupancyPercentage)}>
                        {location.currentOccupancy}/{location.capacity}
                      </span>
                      <span className="text-muted-foreground">{occupancyPercentage}%</span>
                    </div>
                    <Progress value={occupancyPercentage} className="h-1" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{location.sentiment}/10</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-muted-foreground" />
                    <span>{location.facesToday}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(location.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{location.lastUpdate}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Location
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Configure Mirrors
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Location
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}