
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
import { Loader2, Calendar as CalendarIcon, Clock, Plus, Trash2, BookOpen, FileUp, Bell, NotebookPen } from "lucide-react"
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

export default function PlannerPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null)
  const [newSubject, setNewSubject] = useState("")
  const [examDate, setExamDate] = useState("2024-12-25")
  const [freeTime, setFreeTime] = useState(4)
  const [isLoading, setIsLoading] = useState(false)
  const [schedule, setSchedule] = useState<GenerateStudyScheduleOutput | null>(null)
  const [isUploadingTimetable, setIsUploadingTimetable] = useState(false)

  // Note creation state
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("studywise-workspaces")
    if (saved) {
      const parsed = JSON.parse(saved)
      setWorkspaces(parsed)
      if (parsed.length > 0) setActiveWorkspaceId(parsed[0].id)
    }
  }, [])

  useEffect(() => {
    if (workspaces.length > 0) {
      localStorage.setItem("studywise-workspaces", JSON.stringify(workspaces))
    }
  }, [workspaces])

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
    toast({ title: "Workspace Created", description: `Added ${newWs.name} to your study hub.` })
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
          notes: [...ws.notes, {
            id: crypto.randomUUID(),
            title: noteTitle,
            content: noteContent,
            date: new Date().toLocaleDateString()
          }]
        }
      }
      return ws
    }))
    setNoteTitle("")
    setNoteContent("")
    toast({ title: "Note Saved", description: "Successfully stored in your workspace." })
  }

  const handleUploadTimetable = () => {
    setIsUploadingTimetable(true)
    // Simulate parsing PDF timetable
    setTimeout(() => {
      setIsUploadingTimetable(false)
      toast({
        title: "Timetable Processed",
        description: "Found 3 upcoming exams. Reminders have been set.",
      })
    }, 2000)
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
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
              <TabsTrigger value="planner" className="gap-2"><CalendarIcon className="size-4" /> AI Study Planner</TabsTrigger>
              <TabsTrigger value="workspaces" className="gap-2"><BookOpen className="size-4" /> Subject Workspaces</TabsTrigger>
            </TabsList>

            <TabsContent value="planner" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 h-fit">
                  <CardHeader>
                    <CardTitle>Plan Setup</CardTitle>
                    <CardDescription>Configure your study goals and exam dates.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Quick Timetable Sync</Label>
                      <Button variant="outline" className="w-full border-dashed" onClick={handleUploadTimetable} disabled={isUploadingTimetable}>
                        {isUploadingTimetable ? <Loader2 className="mr-2 size-4 animate-spin" /> : <FileUp className="mr-2 size-4" />}
                        Upload Exam PDF
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Current Subjects ({workspaces.length})</Label>
                      <div className="flex flex-wrap gap-2">
                        {workspaces.map((ws) => (
                          <Badge key={ws.id} variant="secondary" className="px-3 py-1">
                            {ws.name}
                          </Badge>
                        ))}
                        {workspaces.length === 0 && <p className="text-xs text-muted-foreground italic">Add subjects in Workspaces tab</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Target Exam Date</Label>
                      <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label>Daily Study Goal (Hours)</Label>
                      <Input type="number" min={1} max={16} value={freeTime} onChange={(e) => setFreeTime(Number(e.target.value))} />
                    </div>

                    <Button className="w-full mt-4" onClick={handleGenerate} disabled={isLoading || workspaces.length === 0}>
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Generate AI Plan"}
                    </Button>
                  </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-6">
                  {schedule ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-headline font-bold">Your Optimized Schedule</h3>
                        <Button variant="ghost" size="sm" onClick={() => setSchedule(null)}>Reset Plan</Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {schedule.studySchedule.map((day, idx) => (
                          <Card key={idx}>
                            <CardHeader className="py-3 bg-muted/30">
                              <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Bell className="size-4 text-primary" />
                                {day.date}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="py-4 space-y-2">
                              {day.activities.map((act, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm border-b border-muted pb-2 last:border-0">
                                  <Clock className="size-3 mt-1 text-muted-foreground" />
                                  <span>{act}</span>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
                      <CalendarIcon className="size-12 text-muted-foreground mb-4 opacity-20" />
                      <h3 className="text-lg font-medium">No Active Plan</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Set up your subjects and exam date to generate a personalized AI study schedule.
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="workspaces" className="space-y-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Create Subject Workspace</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g. Molecular Biology" 
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddWorkspace()}
                    />
                    <Button onClick={handleAddWorkspace}><Plus className="size-4 mr-2" /> Add</Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-2">
                  <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider mb-4">My Subjects</h3>
                  {workspaces.map((ws) => (
                    <div 
                      key={ws.id} 
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${activeWorkspaceId === ws.id ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted'}`}
                      onClick={() => setActiveWorkspaceId(ws.id)}
                    >
                      <span className="font-medium truncate">{ws.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`size-6 rounded-full ${activeWorkspaceId === ws.id ? 'hover:bg-primary-foreground/20 text-white' : 'hover:bg-destructive/10 text-muted-foreground'}`}
                        onClick={(e) => { e.stopPropagation(); handleRemoveWorkspace(ws.id); }}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                  {workspaces.length === 0 && <p className="text-sm text-muted-foreground italic">No workspaces yet.</p>}
                </div>

                <div className="md:col-span-3 space-y-6">
                  {activeWorkspace ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex justify-between items-center border-b pb-4">
                        <h2 className="text-2xl font-headline font-bold">{activeWorkspace.name} Workspace</h2>
                        <Badge>{activeWorkspace.notes.length} Notes</Badge>
                      </div>

                      <Card>
                        <CardHeader>
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
                          />
                          <Textarea 
                            placeholder="Type your study notes here..." 
                            className="min-h-[150px]"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                          />
                          <Button className="w-full" onClick={handleAddNote}>Save to {activeWorkspace.name}</Button>
                        </CardContent>
                      </Card>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Stored Notes</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {activeWorkspace.notes.map((note) => (
                            <Card key={note.id}>
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-lg">{note.title}</CardTitle>
                                  <span className="text-xs text-muted-foreground">{note.date}</span>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                              </CardContent>
                            </Card>
                          ))}
                          {activeWorkspace.notes.length === 0 && (
                            <p className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border-dashed border-2">
                              No notes stored in this workspace yet.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-xl">
                      <BookOpen className="size-12 text-muted-foreground opacity-20 mb-4" />
                      <p className="text-muted-foreground">Select a workspace to view your notes and materials.</p>
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
