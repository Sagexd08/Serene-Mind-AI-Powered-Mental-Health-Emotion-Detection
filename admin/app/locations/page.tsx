"use client";

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LocationTable } from "@/components/location-table"
import { LocationStats } from "@/components/location-stats"
import { Plus, Search, Filter } from "lucide-react"
import { useGlobalContext } from "@/context/global-context-manager"
import { useState } from "react"
import { LocationType } from "@/context/global-context-type"

export default function LocationsPage() {
  const { locations, addLocation, totalLocations, setTotalLocations } = useGlobalContext()
  const [searchTerm, setSearchTerm] = useState("")

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const name = (form.elements.namedItem('name') as HTMLInputElement).value
    const description = (form.elements.namedItem('description') as HTMLInputElement).value
    const capacity = parseInt((form.elements.namedItem('capacity') as HTMLInputElement).value)

    const newLocation: LocationType = {
      id: Date.now(),
      name,
      description,
      mirrorCount: 0,
      onlineMirrors: 0,
      capacity,
      currentOccupancy: 0,
      sentiment: 0,
      facesToday: 0,
      status: "active", // This is now correctly typed as one of the allowed values
      lastUpdate: "Just now",
      mirrors: []
    }

    addLocation(newLocation)
    setTotalLocations(totalLocations + 1)
    form.reset()
  }

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout currentPage="Locations">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search locations..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

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
                <DialogDescription>Create a new location to deploy smart mirrors.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddLocation}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" placeholder="Main Lobby" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input id="description" placeholder="Primary entrance area" className="col-span-3" required />
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
        </div>

        {/* Location Stats Overview */}
        <LocationStats />

        {/* Location Management Table */}
        <Card>
          <CardHeader>
            <CardTitle>Location Management</CardTitle>
            <CardDescription>Manage all smart mirror locations and their configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <LocationTable locations={filteredLocations} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}