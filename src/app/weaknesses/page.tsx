"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { analyzeWeaknesses, type AnalyzeWeaknessesOutput } from "@/ai/flows/analyze-weaknesses"
import { Loader2, TrendingDown, Target, AlertTriangle, Lightbulb } from "lucide-react"

// Mocked initial data for demonstration
const mockPerformance = {
  quizResults: [
    { topic: "Integrals", isCorrect: true },
    { topic: "Derivatives", isCorrect: false },
    { topic: "Limits", isCorrect: false },
    { topic: "Trigonometry", isCorrect: true },
  ],
  timeSpentPerSubject: {
    "Math": 120,
    "Physics": 80,
    "Chemistry": 45
  },
  mistakePatterns: "Student struggles with word problems and tends to make calculation errors in multi-step equations."
}

export default function WeaknessPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AnalyzeWeaknessesOutput | null>(null)

  const handleAnalyze = async () => {
    setIsLoading(true)
    try {
      const data = await analyzeWeaknesses(mockPerformance)
      setAnalysis(data)
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
          <h1 className="font-headline font-bold text-xl">Smart Weakness Detection</h1>
        </header>

        <main className="p-6 space-y-8 max-w-5xl mx-auto w-full">
          {!analysis ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-headline font-bold">Performance Summary</h2>
                  <p className="text-muted-foreground">Based on your recent activity and quiz scores.</p>
                </div>
                <Button onClick={handleAnalyze} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : "Run AI Analysis"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Recent Quizzes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {mockPerformance.quizResults.map((q, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span>{q.topic}</span>
                        <Badge variant={q.isCorrect ? "secondary" : "destructive"}>
                          {q.isCorrect ? "Correct" : "Incorrect"}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Study Time Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(mockPerformance.timeSpentPerSubject).map(([sub, mins]) => (
                        <div key={sub} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{sub}</span>
                            <span>{mins} mins</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${(mins / 150) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-headline font-bold text-primary">AI Weakness Insights</h2>
                <Button variant="outline" onClick={() => setAnalysis(null)}>Refresh Data</Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="size-5" />
                      Critical Weak Areas
                    </CardTitle>
                    <CardDescription>Topics where you struggle most.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.weakAreas.map((area, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-card rounded-lg shadow-sm">
                        <TrendingDown className="size-4 text-destructive" />
                        <span className="font-medium">{area}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-accent/20 bg-accent/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-accent">
                      <Lightbulb className="size-5" />
                      AI Revision Suggestions
                    </CardTitle>
                    <CardDescription>Actionable steps to improve your scores.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.revisionSuggestions.map((sug, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="size-6 bg-accent/20 text-accent flex items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm leading-relaxed">{sug}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="size-5 text-primary" />
                    Recommended Goal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">Focus 70% of your next session on <b>Derivatives</b> and <b>Limits</b>. We've detected a pattern where multi-step calculations are causing errors. Practice breaking them down into 3 distinct steps.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}