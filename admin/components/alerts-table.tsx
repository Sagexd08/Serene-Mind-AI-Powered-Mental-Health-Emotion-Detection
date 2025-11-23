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
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, CheckCircle, Clock, MoreHorizontal, Eye, Check, X, MessageSquare } from "lucide-react"

const alertsData = [
  {
    id: "ALT-001",
    title: "Mirror Offline",
    description: "Break Room Mirror #12 has lost connection",
    severity: "critical",
    category: "system",
    location: "Break Room",
    mirror: "MIR-012",
    status: "active",
    createdAt: "2024-01-15 14:30:25",
    acknowledgedBy: null,
    resolvedAt: null,
  },
  {
    id: "ALT-002",
    title: "High CPU Usage",
    description: "Executive Floor Mirror #6 CPU usage above 80%",
    severity: "warning",
    category: "performance",
    location: "Executive Floor",
    mirror: "MIR-006",
    status: "acknowledged",
    createdAt: "2024-01-15 13:45:12",
    acknowledgedBy: "Admin User",
    resolvedAt: null,
  },
  {
    id: "ALT-003",
    title: "Low Activity Detected",
    description: "Conference Room B showing unusually low face detection",
    severity: "warning",
    category: "performance",
    location: "Conference Room B",
    mirror: "MIR-005",
    status: "active",
    createdAt: "2024-01-15 12:15:08",
    acknowledgedBy: null,
    resolvedAt: null,
  },
  {
    id: "ALT-004",
    title: "Network Latency High",
    description: "Response time above threshold for Main Lobby mirrors",
    severity: "warning",
    category: "network",
    location: "Main Lobby",
    mirror: "Multiple",
    status: "resolved",
    createdAt: "2024-01-15 11:20:45",
    acknowledgedBy: "Tech Support",
    resolvedAt: "2024-01-15 11:45:30",
  },
  {
    id: "ALT-005",
    title: "Storage Space Low",
    description: "Cafeteria Mirror #3 storage usage above 90%",
    severity: "critical",
    category: "system",
    location: "Cafeteria",
    mirror: "MIR-018",
    status: "active",
    createdAt: "2024-01-15 10:30:15",
    acknowledgedBy: null,
    resolvedAt: null,
  },
  {
    id: "ALT-006",
    title: "Sentiment Drop Detected",
    description: "Parking Garage showing significant sentiment decrease",
    severity: "info",
    category: "analytics",
    location: "Parking Garage",
    mirror: "MIR-021",
    status: "acknowledged",
    createdAt: "2024-01-15 09:45:22",
    acknowledgedBy: "Manager",
    resolvedAt: null,
  },
  {
    id: "ALT-007",
    title: "Camera Feed Interrupted",
    description: "Reception Area mirror camera feed temporarily lost",
    severity: "critical",
    category: "system",
    location: "Reception Area",
    mirror: "MIR-003",
    status: "resolved",
    createdAt: "2024-01-15 08:15:33",
    acknowledgedBy: "Admin User",
    resolvedAt: "2024-01-15 08:22:10",
  },
]

export function AlertsTable() {
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "warning":
        return (
          <Badge variant="outline" className="border-yellow-200 text-yellow-800">
            Warning
          </Badge>
        )
      case "info":
        return <Badge variant="secondary">Info</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case "acknowledged":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-red-100 text-red-800">Active</Badge>
      case "acknowledged":
        return (
          <Badge variant="outline" className="border-yellow-200 text-yellow-800">
            Acknowledged
          </Badge>
        )
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const handleSelectAlert = (alertId: string, checked: boolean) => {
    if (checked) {
      setSelectedAlerts([...selectedAlerts, alertId])
    } else {
      setSelectedAlerts(selectedAlerts.filter((id) => id !== alertId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlerts(alertsData.map((alert) => alert.id))
    } else {
      setSelectedAlerts([])
    }
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedAlerts.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">{selectedAlerts.length} alerts selected</span>
          <Button size="sm" variant="outline" className="bg-transparent">
            <Check className="w-4 h-4 mr-2" />
            Acknowledge
          </Button>
          <Button size="sm" variant="outline" className="bg-transparent">
            <CheckCircle className="w-4 h-4 mr-2" />
            Resolve
          </Button>
          <Button size="sm" variant="outline" className="bg-transparent">
            <X className="w-4 h-4 mr-2" />
            Dismiss
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedAlerts.length === alertsData.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all alerts"
                />
              </TableHead>
              <TableHead>Alert</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Acknowledged By</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alertsData.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedAlerts.includes(alert.id)}
                    onCheckedChange={(checked) => handleSelectAlert(alert.id, checked as boolean)}
                    aria-label={`Select alert ${alert.id}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(alert.status)}
                    <div>
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-muted-foreground">{alert.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {alert.mirror} • {alert.category}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                <TableCell>
                  <div className="font-medium">{alert.location}</div>
                  <div className="text-sm text-muted-foreground">{alert.mirror}</div>
                </TableCell>
                <TableCell>{getStatusBadge(alert.status)}</TableCell>
                <TableCell>
                  <div className="text-sm">{getTimeSince(alert.createdAt)}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(alert.createdAt)}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {alert.acknowledgedBy || <span className="text-muted-foreground">Not acknowledged</span>}
                  </div>
                  {alert.resolvedAt && (
                    <div className="text-xs text-muted-foreground">Resolved {getTimeSince(alert.resolvedAt)}</div>
                  )}
                </TableCell>
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
                      {alert.status === "active" && (
                        <DropdownMenuItem>
                          <Check className="mr-2 h-4 w-4" />
                          Acknowledge
                        </DropdownMenuItem>
                      )}
                      {alert.status !== "resolved" && (
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Resolved
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Add Comment
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <X className="mr-2 h-4 w-4" />
                        Dismiss Alert
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
