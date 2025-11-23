"use client";
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MirrorGrid } from "@/components/mirror-grid"
import { MirrorStats } from "@/components/mirror-stats"
import { MirrorFilters } from "@/components/mirror-filters"
import { Search, RefreshCw, Plus } from "lucide-react"
import { useGlobalContext } from "@/context/global-context-manager"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function MirrorsPage() {
  const {
    totalMirrorCount,
    activeMirrors,
    offlineMirrors,
    totalFaceCount,
    mirrors,
    setTotalMirrorCount
  } = useGlobalContext();

  return (
    <DashboardLayout currentPage="Mirrors">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search mirrors..." className="pl-10 w-64" />
            </div>
            <MirrorFilters />
          </div>

          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Mirror
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Mirror</DialogTitle>
                  <DialogDescription>Create a new mirror for the smart mirror network.</DialogDescription>
                </DialogHeader>
                <form >
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input id="name" placeholder="MIR 001" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="ipaddress" className="text-right">
                        IP Address
                      </Label>
                      <Input id="ipaddress" placeholder="192.168.0.1" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="capacity" className="text-right">
                        Capacity
                      </Label>
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="100"
                        className="col-span-3"
                        required
                        min="1"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Location</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Select defaultValue="grid">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mirror Stats Overview */}
        <MirrorStats
          totalMirrors={totalMirrorCount}
          onlineMirrors={activeMirrors}
          offlineMirrors={offlineMirrors}
          activeDetections={totalFaceCount}
        />

        {/* Mirror Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Mirror Network</CardTitle>
            <CardDescription>Real-time status and performance of all smart mirrors</CardDescription>
          </CardHeader>
          <CardContent>
            <MirrorGrid mirrors={mirrors} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}