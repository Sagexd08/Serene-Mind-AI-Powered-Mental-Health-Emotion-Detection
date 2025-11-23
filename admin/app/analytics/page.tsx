import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsOverview } from "@/components/analytics-overview"
import { EmotionAnalytics } from "@/components/emotion-analytics"
import { LocationAnalytics } from "@/components/location-analytics"
import { TrendAnalytics } from "@/components/trend-analytics"
import { PerformanceAnalytics } from "@/components/performance-analytics"
import { Calendar, Download, RefreshCw } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <DashboardLayout currentPage="Analytics">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center gap-4">
            <Select defaultValue="7d">
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="lobby">Main Lobby</SelectItem>
                <SelectItem value="reception">Reception Area</SelectItem>
                <SelectItem value="conference">Conference Rooms</SelectItem>
                <SelectItem value="break">Break Room</SelectItem>
                <SelectItem value="executive">Executive Floor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Analytics Overview */}
        <AnalyticsOverview />

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="emotions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="emotions">Emotions</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="emotions" className="space-y-6">
            <EmotionAnalytics />
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <LocationAnalytics />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <TrendAnalytics />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
