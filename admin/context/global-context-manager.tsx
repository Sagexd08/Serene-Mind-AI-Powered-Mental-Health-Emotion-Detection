"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { GlobalContextType, LocationType, MirrorType } from "./global-context-type"

const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

export function GlobalContextProvider({ children }: { children: ReactNode }) {
  // Locations state
  const [locations, setLocations] = useState<LocationType[]>([])
  const [totalLocations, setTotalLocations] = useState(0)

  // Mirrors state
  const [mirrors, setMirrors] = useState<MirrorType[]>([])
  const [totalMirrorCount, setTotalMirrorCount] = useState(0)

  // Computed values
  const activeMirrors = mirrors.filter((m) => m.status === "online").length
  const offlineMirrors = mirrors.filter((m) => m.status === "offline").length
  const totalFaceCount = mirrors.reduce((acc, m) => acc + m.facesDetected, 0)
  
  const avgOccupancy = locations.length > 0
    ? Math.round(
        locations.reduce((acc, loc) => acc + (loc.currentOccupancy / loc.capacity) * 100, 0) /
        locations.length
      )
    : 0

  const performanceScore = mirrors.length > 0
    ? Math.round(mirrors.reduce((acc, m) => acc + m.uptime, 0) / mirrors.length)
    : 100

  // Location actions
  const addLocation = (location: LocationType) => {
    setLocations((prev) => [...prev, location])
  }

  const removeLocation = (id: number) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id))
  }

  // Mirror actions
  const addMirror = (mirror: MirrorType) => {
    setMirrors((prev) => [...prev, mirror])
  }

  const removeMirror = (id: string) => {
    setMirrors((prev) => prev.filter((m) => m.id !== id))
  }

  const value: GlobalContextType = {
    // Locations
    locations,
    addLocation,
    removeLocation,
    totalLocations,
    setTotalLocations,

    // Mirrors
    mirrors,
    addMirror,
    removeMirror,
    totalMirrorCount,
    setTotalMirrorCount,
    activeMirrors,
    offlineMirrors,

    // Stats
    totalFaceCount,
    avgOccupancy,
    performanceScore,
  }

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
}

export function useGlobalContext() {
  const context = useContext(GlobalContext)
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalContextProvider")
  }
  return context
}
