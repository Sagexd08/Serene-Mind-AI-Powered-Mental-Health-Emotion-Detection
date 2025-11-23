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

export function AlertsFilters() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Severity</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked>Critical</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked>Warning</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Info</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked>Active</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Acknowledged</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Resolved</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Category</DropdownMenuLabel>
        <DropdownMenuCheckboxItem>System</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Network</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Performance</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Security</DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
