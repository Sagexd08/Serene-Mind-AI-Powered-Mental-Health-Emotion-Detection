"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter } from "lucide-react"

export function MirrorFilters() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked>Online</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Offline</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Warning</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Location</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked>Main Lobby</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked>Reception Area</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Conference Rooms</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Break Room</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Performance</DropdownMenuLabel>
        <DropdownMenuCheckboxItem>High Activity</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Low Activity</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Connection Issues</DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
