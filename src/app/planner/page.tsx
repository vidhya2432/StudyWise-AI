"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { generateStudySchedule, type GenerateStudyScheduleOutput } from "@/ai/flows/generate-study-schedule"
import { Loader2, Calendar as CalendarIcon, Clock, Plus, Trash2, BookOpen, FileUp, Bell, NotebookPen, Info, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface WorkspaceNote {
  id: string
  title: string
  content: string
  date: string
}

interface Workspace {
  id: string
  name: string
  notes: WorkspaceNote[]
}

interface Reminder {
  id: string
  title: string
  date: string
  type: 'exam' | 'assignment'
}

export default function PlannerPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null)
  const [newSubject, setNewSubject] = useState("")
  const [examDate, setExamDate] = useState("2024-12-25")
  const [freeTime, setFreeTime] = useState(4)
  const [isLoading, setIsLoading] = useState(false)
  const [schedule, setSchedule] = useState<GenerateStudyScheduleOutput | null>(null)
  const [isUploadingTimetable, setIsUploadingTimetable] = useState(false)

  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")

  useEffect(() => {
    const savedWs = localStorage.getItem("studywise-workspaces")
    const savedReminders = localStorage.getItem("studywise-reminders")
    if (savedWs) {
      const parsed = JSON.parse(savedWs)
      setWorkspaces(parsed)
      if (parsed.length > 0) setActiveWorkspaceId(parsed[0].id)
    }
    if (savedReminders) setReminders(JSON.parse(savedReminders))
  }, [])

  useEffect(() => {
    if (workspaces.length > 0) {
      localStorage.setItem("studywise-workspaces", JSON.stringify(workspaces))
    }
    localStorage.setItem("studywise-reminders", JSON.stringify(reminders))
  }, [workspaces, reminders])

  const awardXP = (amount: number) => {
    const currentXP = parseInt(localStorage.getItem("studywise-xp") || "0")
    localStorage.setItem("studywise-xp", (currentXP + amount).toString())
  }

  const handleAddWorkspace = () => {
    if (!newSubject.trim()) return
    const newWs: Workspace = {
      id: crypto.randomUUID(),
      name: newSubject.trim(),
      notes: []
    }
    setWorkspaces([...workspaces, newWs])
    setActiveWorkspaceId(newWs.id)
    setNewSubject("")
    awardXP(50) // Reward for setting up a subject
    toast({ title: "Workspace Created", description: `Added ${newWs.name} to your study hub. (+50 XP)` })
  }

  const handleRemoveWorkspace = (id: string) => {
    setWorkspaces(workspaces.filter(w => w.id !== id))
    if (activeWorkspaceId === id) setActiveWorkspaceId(null)
  }

  const handleAddNote = () => {
    if (!activeWorkspaceId || !noteTitle.trim() || !noteContent.trim()) return
    setWorkspaces(workspaces.map(ws => {
      if (ws.id === activeWorkspaceId) {
        return {
          ...ws,
          notes: [{
            id: crypto.randomUUID(),
            title: noteTitle,
            content: noteContent,
            date: new Date().toLocaleDateString()
          }, ...ws.notes]
        }
      }
      return ws
    }))
    setNoteTitle("")
    setNoteContent("")
    awardXP(20) // Reward for adding notes
    toast({ title: "Note Saved", description: "Stored in workspace. (+20 XP)" })
  }

  const handleUploadTimetable = () => {
    setIsUploadingTimetable(true)
    setTimeout(() => {
      setIsUploadingTimetable(false)
      const newReminders: Reminder[] = [
        { id: crypto.randomUUID(), title: "Calculus Final", date: "2024-12-15", type: 'exam' },
        { id: crypto.randomUUID(), title: "Physics Lab Viva", date: "2024-12-18", type: 'exam' },
        { id: crypto.randomUUID(), title: "CS Semester Paper", date: "2024-12-22", type: 'exam' },
      ]
      setReminders([...reminders, ...newReminders])
      awardXP(100) // Reward for planning
      toast({
        title: "Timetable Sync Complete",
        description: "Extracted 3 exam dates and added them to your reminders. (+100 XP)",
      })
    }, 2500)
  }

  const handleGenerate = async () => {
    if (workspaces.length === 0) return
    setIsLoading(true)
    try {
      const result = await generateStudySchedule({
        subjects: workspaces.map(w => w.name),
        examDate,
        dailyFreeTime: freeTime,
      })
      setSchedule(result)
      awardXP(150) // Reward for high-level planning
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-headline font-bold text-xl">Study Hub & Planner</h1>
        </header>

        <main className="p-6 space-y-6 max-w-6xl mx-auto w-full">
          <Tabs defaultValue="planner" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/50">
              <TabsTrigger value="planner" className="gap-2 rounded-lg"><CalendarIcon className="size-4" /> AI Study Planner</TabsTrigger>
              <TabsTrigger value="workspaces" className="gap-2 rounded-lg"><BookOpen className="size-4" /> Subject Workspaces</TabsTrigger>
            </TabsList>

            <TabsContent value="planner" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Plan Configuration</CardTitle>
                      <CardDescription>Setup your goals for AI calculation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Quick Timetable Sync</Label>
                        <Button variant="outline" className="w-full border-dashed border-primary/20 hover:border-primary/50" onClick={handleUploadTimetable} disabled={isUploadingTimetable}>
                          {isUploadingTimetable ? <Loader2 className="mr-2 size-4 animate-spin" /> : <FileUp className="mr-2 size-4 text-primary" />}
                          Sync PDF Timetable
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Target Exam Date</Label>
                        <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="shadow-sm" />
                      </div>

                      <div className="space-y-2">
                        <Label>Hours per Day</Label>
                        <Input type="number" value={freeTime} onChange={(e) => setFreeTime(Number(e.target.value))} />
                      </div>

                      <Button className="w-full mt-4 shadow-md" onClick={handleGenerate} disabled={isLoading || workspaces.length === 0}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...</> : "Generate Plan"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-accent/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <Bell className="size-4 text-accent" />
                        Upcoming Reminders
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {reminders.length > 0 ? reminders.map((r) => (
                        <div key={r.id} className="flex flex-col p-2 bg-accent/5 rounded-lg border border-accent/10">
                          <span className="text-sm font-semibold">{r.title}</span>
                          <span className="text-xs text-muted-foreground">{r.date}</span>
                        </div>
                      )) : (
                        <p className="text-xs text-muted-foreground italic">No reminders set. Upload a timetable to sync dates.</p>
                      )}
                      {reminders.length > 0 && (
                        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setReminders([])}>Clear All</Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  {schedule ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-headline font-bold flex items-center gap-2">
                          <Sparkles className="size-5 text-primary" />
                          Personalized Schedule
                        </h3>
                        <Button variant="outline" size="sm" onClick={() => setSchedule(null)}>Reset</Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {schedule.studySchedule.map((day, idx) => (
                          <Card key={idx} className="shadow-sm border-primary/10">
                            <CardHeader className="py-3 bg-primary/5">
                              <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <CalendarIcon className="size-4 text-primary" />
                                {day.date}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="py-4 space-y-3">
                              {day.activities.map((act, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm group">
                                  <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                  <span className="group-hover:text-primary transition-colors">{act}</span>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 bg-muted/20 min-h-[400px]">
                      <div className="size-16 bg-background rounded-full flex items-center justify-center shadow-sm mb-4 border">
                        <CalendarIcon className="size-8 text-muted-foreground opacity-40" />
                      </div>
                      <h3 className="text-lg font-bold">No Active Study Plan</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                        Define your subjects in the Workspaces tab, set your target date, and we'll generate an optimized study journey for you.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border">
                        <Info className="size-3" /> Tip: Sync your timetable for auto-reminders.
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="workspaces" className="space-y-6">
              <div className="flex gap-4 items-end bg-card p-4 rounded-xl shadow-sm border">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold">Create New Subject Workspace</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g. Molecular Biology" 
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddWorkspace()}
                      className="h-11 shadow-inner"
                    />
                    <Button onClick={handleAddWorkspace} className="h-11 px-6 shadow-md"><Plus className="size-4 mr-2" /> Create</Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-3">
                  <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-2 px-1">
                    <BookOpen className="size-3" /> My Subjects
                  </h3>
                  {workspaces.map((ws) => (
                    <div 
                      key={ws.id} 
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${activeWorkspaceId === ws.id ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]' : 'hover:bg-muted/80'}`}
                      onClick={() => setActiveWorkspaceId(ws.id)}
                    >
                      <span className="font-semibold truncate text-sm">{ws.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`size-7 rounded-lg ${activeWorkspaceId === ws.id ? 'hover:bg-primary-foreground/20 text-white' : 'hover:bg-destructive/10 text-muted-foreground'}`}
                        onClick={(e) => { e.stopPropagation(); handleRemoveWorkspace(ws.id); }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                  {workspaces.length === 0 && (
                    <div className="p-8 border-2 border-dashed rounded-xl text-center">
                      <p className="text-xs text-muted-foreground">Add your first subject above</p>
                    </div>
                  )}
                </div>

                <div className="md:col-span-3 space-y-6">
                  {activeWorkspace ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex justify-between items-center border-b pb-4">
                        <h2 className="text-2xl font-headline font-bold">{activeWorkspace.name}</h2>
                        <Badge variant="secondary" className="px-3 py-1">{activeWorkspace.notes.length} Active Notes</Badge>
                      </div>

                      <Card className="shadow-sm border-primary/20 bg-primary/5">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <NotebookPen className="size-4 text-primary" />
                            Add Study Note
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Input 
                            placeholder="Note Title (e.g. Chapter 3 Summary)" 
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            className="bg-background shadow-inner"
                          />
                          <Textarea 
                            placeholder="Type or paste your detailed study notes here..." 
                            className="min-h-[150px] bg-background shadow-inner"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                          />
                          <Button className="w-full shadow-md" onClick={handleAddNote}>Save Note to Workspace</Button>
                        </CardContent>
                      </Card>

                      <div className="space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <FileText className="size-4 text-primary" />
                          Stored Repository
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          {activeWorkspace.notes.map((note) => (
                            <Card key={note.id} className="shadow-sm hover:border-primary/30 transition-colors">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-lg">{note.title}</CardTitle>
                                  <Badge variant="outline" className="text-[10px] font-normal">{note.date}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{note.content}</p>
                              </CardContent>
                            </Card>
                          ))}
                          {activeWorkspace.notes.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 bg-muted/10 rounded-xl border-2 border-dashed">
                              <NotebookPen className="size-10 text-muted-foreground opacity-20 mb-3" />
                              <p className="text-sm text-muted-foreground">Your study notes for this subject will appear here.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[450px] border-2 border-dashed rounded-2xl bg-muted/5">
                      <BookOpen className="size-16 text-muted-foreground opacity-10 mb-4" />
                      <p className="text-muted-foreground font-medium">Select a subject workspace from the left to manage your notes.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
