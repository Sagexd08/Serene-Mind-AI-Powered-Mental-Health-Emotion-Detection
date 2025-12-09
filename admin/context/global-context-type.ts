export interface MirrorType {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "warning";
  ipAddress: string;
  lastPing: string;
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  temperature: number;
  facesDetected: number;
  totalFaceDetected: number;
  lastUpdate: string;
}

export interface LocationType {
  id: number;
  name: string;
  place: string;
  description: string;
  mirrorCount: number;
  onlineMirrors: number;
  capacity: number;
  currentOccupancy: number;
  sentiment: number;
  facesToday: number;
  status: "active" | "warning" | "offline";
  lastUpdate: string;
  mirrors: MirrorType[];
}

export interface GlobalContextType {
  // Locations
  locations: LocationType[];
  addLocation: (location: LocationType) => void;
  removeLocation: (id: number) => void;
  totalLocations: number;
  setTotalLocations: (count: number) => void;

  // Mirrors
  mirrors: MirrorType[];
  addMirror: (mirror: MirrorType) => void;
  removeMirror: (id: string) => void;
  totalMirrorCount: number;
  setTotalMirrorCount: (count: number) => void;
  activeMirrors: number;
  offlineMirrors: number;

  // Stats
  totalFaceCount: number;
  avgOccupancy: number;
  performanceScore: number;
}
