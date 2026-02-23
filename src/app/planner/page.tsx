"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { generateStudySchedule, type GenerateStudyScheduleOutput } from "@/ai/flows/generate-study-schedule"
import { Loader2, Calendar as CalendarIcon, Clock, Plus, Trash2 } from "lucide-react"

export default function PlannerPage() {
  const [subjects, setSubjects] = useState<string[]>(["Math", "Physics"])
  const [newSubject, setNewSubject] = useState("")
  const [examDate, setExamDate] = useState("2024-12-25")
  const [freeTime, setFreeTime] = useState(4)
  const [isLoading, setIsLoading] = useState(false)
  const [schedule, setSchedule] = useState<GenerateStudyScheduleOutput | null>(null)

  const handleAddSubject = () => {
    if (newSubject.trim()) {
      setSubjects([...subjects, newSubject.trim()])
      setNewSubject("")
    }
  }

  const handleRemoveSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index))
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const result = await generateStudySchedule({
        subjects,
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-headline font-bold text-xl">AI Study Planner</h1>
        </header>

        <main className="p-6 space-y-6 max-w-5xl mx-auto w-full">
          {!schedule ? (
            <Card>
              <CardHeader>
                <CardTitle>Create Your Study Plan</CardTitle>
                <CardDescription>Tell us about your exams and we'll craft a personalized schedule.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Subjects to Study</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter subject name..." 
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                    />
                    <Button onClick={handleAddSubject} size="icon" variant="secondary">
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {subjects.map((s, i) => (
                      <Badge key={i} variant="secondary" className="pl-3 pr-1 py-1 gap-1">
                        {s}
                        <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full p-0" onClick={() => handleRemoveSubject(i)}>
                          <Trash2 className="size-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Exam Start Date</Label>
                    <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Free Time (Hours)</Label>
                    <Input type="number" min={1} max={16} value={freeTime} onChange={(e) => setFreeTime(Number(e.target.value))} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" onClick={handleGenerate} disabled={isLoading || subjects.length === 0}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Schedule...</> : "Generate AI Plan"}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-headline font-bold">Your Personalized Plan</h2>
                <Button variant="outline" onClick={() => setSchedule(null)}>Edit Details</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CalendarIcon className="size-5 text-primary" />
                    Daily Schedule
                  </h3>
                  {schedule.studySchedule.map((day, idx) => (
                    <Card key={idx}>
                      <CardHeader className="py-3 bg-muted/50">
                        <CardTitle className="text-sm font-medium">{day.date}</CardTitle>
                      </CardHeader>
                      <CardContent className="py-4 space-y-2">
                        {day.activities.map((act, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <Clock className="size-4 mt-0.5 text-muted-foreground" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Revision Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      {schedule.revisionPlan.map((plan, i) => (
                        <p key={i} className="border-l-2 border-primary pl-3 py-1">{plan}</p>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-accent/5 border-accent/20">
                    <CardHeader>
                      <CardTitle className="text-sm text-accent font-bold uppercase tracking-wider">AI Focus Areas</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      {schedule.focusAreas.map((focus, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                          <span>{focus}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}