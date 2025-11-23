"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { MapPin, TrendingUp, TrendingDown, Users, Eye } from "lucide-react"

const locationPerformance = [
  {
    location: "Main Lobby",
    interactions: 2456,
    uniqueVisitors: 1234,
    avgSentiment: 8.2,
    peakHour: "12:00 PM",
    engagement: "high",
    trend: "up",
    change: "+15%",
  },
  {
    location: "Reception Area",
    interactions: 1567,
    uniqueVisitors: 892,
    avgSentiment: 7.1,
    peakHour: "10:00 AM",
    engagement: "medium",
    trend: "up",
    change: "+8%",
  },
  {
    location: "Conference Room A",
    interactions: 892,
    uniqueVisitors: 456,
    avgSentiment: 7.8,
    peakHour: "2:00 PM",
    engagement: "medium",
    trend: "stable",
    change: "+2%",
  },
  {
    location: "Break Room",
    interactions: 634,
    uniqueVisitors: 234,
    avgSentiment: 6.3,
    peakHour: "12:30 PM",
    engagement: "low",
    trend: "down",
    change: "-5%",
  },
  {
    location: "Executive Floor",
    interactions: 1123,
    uniqueVisitors: 567,
    avgSentiment: 8.5,
    peakHour: "9:00 AM",
    engagement: "high",
    trend: "up",
    change: "+12%",
  },
  {
    location: "Cafeteria",
    interactions: 3456,
    uniqueVisitors: 1789,
    avgSentiment: 7.9,
    peakHour: "12:00 PM",
    engagement: "high",
    trend: "up",
    change: "+18%",
  },
]

const hourlyTraffic = [
  { hour: "6:00", lobby: 12, reception: 8, cafeteria: 45, breakroom: 5 },
  { hour: "8:00", lobby: 89, reception: 67, cafeteria: 234, breakroom: 23 },
  { hour: "10:00", lobby: 156, reception: 123, cafeteria: 189, breakroom: 34 },
  { hour: "12:00", lobby: 234, reception: 89, cafeteria: 456, breakroom: 67 },
  { hour: "14:00", lobby: 189, reception: 78, cafeteria: 345, breakroom: 45 },
  { hour: "16:00", lobby: 145, reception: 56, cafeteria: 234, breakroom: 34 },
  { hour: "18:00", lobby: 78, reception: 34, cafeteria: 123, breakroom: 12 },
]

const comparisonData = [
  { location: "Main Lobby", thisWeek: 2456, lastWeek: 2134 },
  { location: "Reception", thisWeek: 1567, lastWeek: 1452 },
  { location: "Conference A", thisWeek: 892, lastWeek: 874 },
  { location: "Break Room", thisWeek: 634, lastWeek: 667 },
  { location: "Executive", thisWeek: 1123, lastWeek: 1002 },
  { location: "Cafeteria", thisWeek: 3456, lastWeek: 2934 },
]

export function LocationAnalytics() {
  const getEngagementBadge = (engagement: string) => {
    switch (engagement) {
      case "high":
        return <Badge className="bg-green-100 text-green-800">High</Badge>
      case "medium":
        return (
          <Badge variant="outline" className="border-yellow-200 text-yellow-800">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="border-red-200 text-red-800">
            Low
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getTrendIcon = (trend: string, change: string) => {
    if (trend === "up") {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    } else if (trend === "down") {
      return <TrendingDown className="w-4 h-4 text-red-600" />
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hourly Traffic Patterns</CardTitle>
            <CardDescription>Visitor patterns throughout the day by location</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyTraffic}>
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
                <Line type="monotone" dataKey="lobby" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Main Lobby" />
                <Line
                  type="monotone"
                  dataKey="reception"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Reception"
                />
                <Line
                  type="monotone"
                  dataKey="cafeteria"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  name="Cafeteria"
                />
                <Line
                  type="monotone"
                  dataKey="breakroom"
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={2}
                  name="Break Room"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Week-over-Week Comparison</CardTitle>
            <CardDescription>Interaction volume comparison by location</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="location" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="thisWeek" fill="hsl(var(--chart-1))" name="This Week" />
                <Bar dataKey="lastWeek" fill="hsl(var(--chart-2))" name="Last Week" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location Performance Summary</CardTitle>
          <CardDescription>Detailed analytics for each location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locationPerformance.map((location) => (
              <div key={location.location} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold">{location.location}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getEngagementBadge(location.engagement)}
                    <div className="flex items-center gap-1 text-sm">
                      {getTrendIcon(location.trend, location.change)}
                      <span
                        className={
                          location.trend === "up"
                            ? "text-green-600"
                            : location.trend === "down"
                              ? "text-red-600"
                              : "text-muted-foreground"
                        }
                      >
                        {location.change}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      <span>Interactions</span>
                    </div>
                    <div className="font-semibold">{location.interactions.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>Unique Visitors</span>
                    </div>
                    <div className="font-semibold">{location.uniqueVisitors.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Sentiment</div>
                    <div className="font-semibold">{location.avgSentiment}/10</div>
                    <Progress value={location.avgSentiment * 10} className="h-1 mt-1" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Peak Hour</div>
                    <div className="font-semibold">{location.peakHour}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
