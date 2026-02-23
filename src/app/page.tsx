"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Flame, Clock, Trophy, Target, BrainCircuit } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

const studyData = [
  { day: "Mon", hours: 4 },
  { day: "Tue", hours: 3 },
  { day: "Wed", hours: 5 },
  { day: "Thu", hours: 2 },
  { day: "Fri", hours: 6 },
  { day: "Sat", hours: 4 },
  { day: "Sun", hours: 1 },
]

const chartConfig = {
  hours: {
    label: "Hours Studied",
    color: "hsl(var(--primary))",
  },
}

export default function Dashboard() {
  const [motivation] = useState("Keep pushing! Your hard work today builds your success tomorrow.")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-headline font-bold text-xl">Dashboard</h1>
        </header>
        
        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-primary text-primary-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Flame className="size-4" />
                  Daily Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12 Days</div>
                <p className="text-xs text-primary-foreground/70">Highest: 15 days</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="size-4" />
                  Weekly Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">25.5h</div>
                <p className="text-xs text-muted-foreground">+2.5h from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="size-4" />
                  XP Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4,250</div>
                <p className="text-xs text-muted-foreground">Top 5% of students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="size-4" />
                  Exam Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">Calculus Final</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Study Hours Graph</CardTitle>
                <CardDescription>Your focus time over the last 7 days.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer config={chartConfig}>
                  <BarChart data={studyData}>
                    <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="hours" fill="var(--color-hours)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-accent/10 border-accent/20">
              <CardHeader>
                <CardTitle className="text-accent flex items-center gap-2">
                  <BrainCircuit className="size-5" />
                  AI Motivation
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-between h-[200px]">
                <p className="text-lg italic font-medium">"{motivation}"</p>
                <div className="text-sm text-muted-foreground">
                  AI generated based on your recent consistency.
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
