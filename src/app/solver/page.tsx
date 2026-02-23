"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { explainConcept, type ExplainConceptOutput } from "@/ai/flows/explain-concept"
import { Loader2, Search, HelpCircle, Lightbulb, BookOpenCheck } from "lucide-react"

export default function SolverPage() {
  const [concept, setConcept] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ExplainConceptOutput | null>(null)

  const handleSolve = async () => {
    if (!concept.trim()) return
    setIsLoading(true)
    try {
      const data = await explainConcept({ concept })
      setResult(data)
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
          <h1 className="font-headline font-bold text-xl">AI Doubt Solver</h1>
        </header>

        <main className="p-6 space-y-8 max-w-4xl mx-auto w-full">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-headline font-bold text-primary">What's on your mind?</h2>
            <p className="text-muted-foreground">Ask anything from "Quantum Entanglement" to "How to balance chemical equations".</p>
          </div>

          <div className="relative group max-w-2xl mx-auto">
            <Input 
              className="h-14 pl-12 pr-32 text-lg rounded-2xl shadow-lg border-primary/20 focus-visible:ring-primary"
              placeholder="e.g. Explain photosynthesis simple terms..."
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSolve()}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Button 
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl"
              onClick={handleSolve}
              disabled={isLoading || !concept}
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Solve"}
            </Button>
          </div>

          {result && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <HelpCircle className="size-5" />
                    Explanation
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p className="text-lg leading-relaxed">{result.explanation}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-secondary/10 border-secondary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-secondary">
                      <Lightbulb className="size-5" />
                      Practical Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{result.example}</p>
                  </CardContent>
                </Card>

                <Card className="bg-accent/10 border-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-accent">
                      <BookOpenCheck className="size-5" />
                      Practice Question
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="font-medium">{result.practiceQuestion}</p>
                    <Button variant="outline" size="sm" className="w-full">Reveal Hint</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}