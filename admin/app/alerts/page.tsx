import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertsTable } from "@/components/alerts-table"
import { AlertsStats } from "@/components/alerts-stats"
import { AlertsFilters } from "@/components/alerts-filters"
import { AlertSettings } from "@/components/alert-settings"
import { Search, RefreshCw, Download } from "lucide-react"

export default function AlertsPage() {
  return (
    <DashboardLayout currentPage="Alerts">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search alerts..." className="pl-10 w-64" />
            </div>
            <AlertsFilters />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <AlertSettings />
          </div>
        </div>

        {/* Alert Stats Overview */}
        <AlertsStats />

        {/* Alerts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Management</CardTitle>
            <CardDescription>Monitor and manage all system alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertsTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
