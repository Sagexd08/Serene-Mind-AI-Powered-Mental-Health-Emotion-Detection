"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Bell, Mail, MessageSquare, Smartphone } from "lucide-react"

export function AlertSettings() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Alert Settings</DialogTitle>
          <DialogDescription>Configure alert thresholds and notification preferences</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="thresholds" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="escalation">Escalation</TabsTrigger>
          </TabsList>

          <TabsContent value="thresholds" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">System Thresholds</CardTitle>
                  <CardDescription>Configure when system alerts are triggered</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cpu-threshold" className="text-right">
                      CPU Usage
                    </Label>
                    <Input id="cpu-threshold" defaultValue="80" className="col-span-2" />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="memory-threshold" className="text-right">
                      Memory Usage
                    </Label>
                    <Input id="memory-threshold" defaultValue="85" className="col-span-2" />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="storage-threshold" className="text-right">
                      Storage Usage
                    </Label>
                    <Input id="storage-threshold" defaultValue="90" className="col-span-2" />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="temp-threshold" className="text-right">
                      Temperature
                    </Label>
                    <Input id="temp-threshold" defaultValue="75" className="col-span-2" />
                    <span className="text-sm text-muted-foreground">°F</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Thresholds</CardTitle>
                  <CardDescription>Configure performance-related alert triggers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="response-threshold" className="text-right">
                      Response Time
                    </Label>
                    <Input id="response-threshold" defaultValue="100" className="col-span-2" />
                    <span className="text-sm text-muted-foreground">ms</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="uptime-threshold" className="text-right">
                      Min Uptime
                    </Label>
                    <Input id="uptime-threshold" defaultValue="95" className="col-span-2" />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="activity-threshold" className="text-right">
                      Low Activity
                    </Label>
                    <Input id="activity-threshold" defaultValue="5" className="col-span-2" />
                    <span className="text-sm text-muted-foreground">faces/hour</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sentiment-threshold" className="text-right">
                      Sentiment Drop
                    </Label>
                    <Input id="sentiment-threshold" defaultValue="6.0" className="col-span-2" />
                    <span className="text-sm text-muted-foreground">/10</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notification Channels</CardTitle>
                  <CardDescription>Choose how you want to receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      <Label htmlFor="in-app">In-App Notifications</Label>
                    </div>
                    <Switch id="in-app" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <Label htmlFor="email">Email Notifications</Label>
                    </div>
                    <Switch id="email" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <Label htmlFor="slack">Slack Integration</Label>
                    </div>
                    <Switch id="slack" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <Label htmlFor="sms">SMS Alerts</Label>
                    </div>
                    <Switch id="sms" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notification Preferences</CardTitle>
                  <CardDescription>Customize when and how often you receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="frequency" className="text-right">
                      Frequency
                    </Label>
                    <Select defaultValue="immediate">
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="5min">Every 5 minutes</SelectItem>
                        <SelectItem value="15min">Every 15 minutes</SelectItem>
                        <SelectItem value="hourly">Hourly digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quiet-hours" className="text-right">
                      Quiet Hours
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input placeholder="22:00" className="flex-1" />
                      <span className="text-sm text-muted-foreground">to</span>
                      <Input placeholder="08:00" className="flex-1" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weekend">Weekend Notifications</Label>
                    <Switch id="weekend" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="critical-only">Critical Only Mode</Label>
                    <Switch id="critical-only" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="escalation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Escalation Rules</CardTitle>
                <CardDescription>Define how unresolved alerts are escalated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Level 1: Initial Alert</div>
                      <div className="text-sm text-muted-foreground">Notify assigned technician immediately</div>
                    </div>
                    <div className="text-sm text-muted-foreground">0 minutes</div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Level 2: Team Lead</div>
                      <div className="text-sm text-muted-foreground">Escalate to team lead if unacknowledged</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input defaultValue="15" className="w-16" />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Level 3: Manager</div>
                      <div className="text-sm text-muted-foreground">Notify manager if still unresolved</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input defaultValue="30" className="w-16" />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Level 4: Executive</div>
                      <div className="text-sm text-muted-foreground">Critical alerts only - notify executives</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input defaultValue="60" className="w-16" />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-escalate">Enable Auto-Escalation</Label>
                  <Switch id="auto-escalate" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
