"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Flame, Clock, Trophy, Target, BrainCircuit, Sparkles, RefreshCw, Play, Pause, RotateCcw, GraduationCap } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect, useRef } from "react"
import { generateMotivation, type GenerateMotivationOutput } from "@/ai/flows/generate-motivation"

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
  const [motivation, setMotivation] = useState<GenerateMotivationOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({ workspaces: 0, notes: 0, xp: 0 })
  
  // Pomodoro Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // XP Goal Logic
  const dailyXPGoal = 1000
  const xpProgress = Math.min((stats.xp / dailyXPGoal) * 100, 100)

  useEffect(() => {
    const savedWs = localStorage.getItem("studywise-workspaces")
    const savedXP = localStorage.getItem("studywise-xp")
    
    let workspacesCount = 0
    let noteCount = 0
    
    if (savedWs) {
      const parsed = JSON.parse(savedWs)
      workspacesCount = parsed.length
      noteCount = parsed.reduce((acc: number, ws: any) => acc + ws.notes.length, 0)
    }
    
    setStats({ 
      workspaces: workspacesCount, 
      notes: noteCount,
      xp: savedXP ? parseInt(savedXP) : 0
    })
    
    handleRefreshMotivation()
  }, [])

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      if (timerRef.current) clearInterval(timerRef.current)
      // Award XP for completing a session
      const newXP = stats.xp + 100
      localStorage.setItem("studywise-xp", newXP.toString())
      setStats(prev => ({ ...prev, xp: newXP }))
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, timeLeft, stats.xp])

  const handleRefreshMotivation = async () => {
    setIsLoading(true)
    try {
      const saved = localStorage.getItem("studywise-workspaces")
      const subjects = saved ? JSON.parse(saved).map((ws: any) => ws.name) : ["General Study"]
      const data = await generateMotivation({ subjects, streak: 12 })
      setMotivation(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => setIsActive(!isActive)
  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(25 * 60)
  }

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
          {/* Daily XP Goal Progress */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                    <GraduationCap className="size-6 text-primary" />
                    Daily XP Goal
                  </h2>
                  <p className="text-sm text-muted-foreground">Keep studying to reach your daily target of {dailyXPGoal.toLocaleString()} XP!</p>
                </div>
                <div className="flex-1 w-full max-w-md space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>{stats.xp.toLocaleString()} XP</span>
                    <span className="text-primary">{Math.round(xpProgress)}%</span>
                  </div>
                  <Progress value={xpProgress} className="h-3 shadow-inner" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-primary text-primary-foreground shadow-lg">
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
                  Total Workspaces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.workspaces}</div>
                <p className="text-xs text-muted-foreground">Active study hubs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="size-4" />
                  Notes Stored
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.notes}</div>
                <p className="text-xs text-muted-foreground">Across all subjects</p>
              </CardContent>
            </Card>

            <Card className="bg-accent text-accent-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="size-4" />
                  XP Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.xp.toLocaleString()}</div>
                <p className="text-xs opacity-80">Rank: Gold Scholar</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm">
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
            </div>

            <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="size-5 text-primary" />
                    Pomodoro Focus
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 py-6">
                  <div className="text-5xl font-mono font-bold tracking-tighter text-primary">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant={isActive ? "outline" : "default"} onClick={toggleTimer} className="size-12 rounded-full shadow-md">
                      {isActive ? <Pause className="size-5" /> : <Play className="size-5" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={resetTimer} className="size-12 rounded-full">
                      <RotateCcw className="size-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Complete a 25m session to earn 100 XP</p>
                </CardContent>
              </Card>

              <Card className="bg-accent/5 border-accent/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={handleRefreshMotivation} disabled={isLoading}>
                    <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <CardHeader>
                  <CardTitle className="text-accent flex items-center gap-2">
                    <BrainCircuit className="size-5" />
                    AI Study Coach
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {motivation ? (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <p className="text-lg italic font-medium leading-tight">"{motivation.motivation}"</p>
                      <Separator className="bg-accent/20" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase text-accent tracking-wider flex items-center gap-1">
                          <Sparkles className="size-3" /> Daily Tip
                        </p>
                        <p className="text-sm text-muted-foreground">{motivation.dailyTip}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <Separator className="bg-muted" />
                      <div className="h-12 bg-muted rounded w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
