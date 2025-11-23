"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

const emotionDistribution = [
  { name: "Happy", value: 42, color: "hsl(var(--chart-1))", count: 3456 },
  { name: "Neutral", value: 28, color: "hsl(var(--chart-2))", count: 2304 },
  { name: "Surprised", value: 15, color: "hsl(var(--chart-3))", count: 1235 },
  { name: "Sad", value: 10, color: "hsl(var(--chart-4))", count: 823 },
  { name: "Angry", value: 5, color: "hsl(var(--chart-5))", count: 412 },
]

const emotionTrends = [
  { day: "Mon", happy: 45, neutral: 25, surprised: 12, sad: 8, angry: 10 },
  { day: "Tue", happy: 42, neutral: 28, surprised: 15, sad: 10, angry: 5 },
  { day: "Wed", happy: 48, neutral: 22, surprised: 18, sad: 7, angry: 5 },
  { day: "Thu", happy: 40, neutral: 30, surprised: 14, sad: 12, angry: 4 },
  { day: "Fri", happy: 52, neutral: 20, surprised: 16, sad: 8, angry: 4 },
  { day: "Sat", happy: 38, neutral: 32, surprised: 12, sad: 15, angry: 3 },
  { day: "Sun", happy: 35, neutral: 35, surprised: 10, sad: 18, angry: 2 },
]

const locationEmotions = [
  { location: "Main Lobby", happy: 52, neutral: 25, sentiment: 8.2 },
  { location: "Reception", happy: 38, neutral: 35, sentiment: 7.1 },
  { location: "Conference A", happy: 45, neutral: 28, sentiment: 7.8 },
  { location: "Break Room", happy: 28, neutral: 42, sentiment: 6.3 },
  { location: "Executive Floor", happy: 58, neutral: 22, sentiment: 8.5 },
]

export function EmotionAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emotion Distribution</CardTitle>
            <CardDescription>Overall emotion breakdown for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={emotionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {emotionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value}% (${emotionDistribution.find((e) => e.name === name)?.count} detections)`,
                    name,
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emotion Trends</CardTitle>
            <CardDescription>Daily emotion patterns over the week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emotionTrends}>
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
                <Bar dataKey="happy" stackId="a" fill="hsl(var(--chart-1))" name="Happy" />
                <Bar dataKey="neutral" stackId="a" fill="hsl(var(--chart-2))" name="Neutral" />
                <Bar dataKey="surprised" stackId="a" fill="hsl(var(--chart-3))" name="Surprised" />
                <Bar dataKey="sad" stackId="a" fill="hsl(var(--chart-4))" name="Sad" />
                <Bar dataKey="angry" stackId="a" fill="hsl(var(--chart-5))" name="Angry" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emotion Details</CardTitle>
            <CardDescription>Detailed breakdown with detection counts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emotionDistribution.map((emotion) => (
                <div key={emotion.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emotion.color }}></div>
                      <span className="font-medium">{emotion.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{emotion.value}%</div>
                      <div className="text-sm text-muted-foreground">{emotion.count.toLocaleString()} detections</div>
                    </div>
                  </div>
                  <Progress value={emotion.value} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location Sentiment</CardTitle>
            <CardDescription>Happiness levels and sentiment scores by location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationEmotions.map((location) => (
                <div key={location.location} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{location.location}</span>
                    <div className="text-right">
                      <div className="font-semibold">{location.sentiment}/10</div>
                      <div className="text-sm text-muted-foreground">{location.happy}% happy</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Progress value={location.happy} className="h-2 flex-1" />
                    <Progress value={location.neutral} className="h-2 flex-1 opacity-60" />
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
