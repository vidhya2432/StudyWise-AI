"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { processNotes, type ProcessNotesOutput } from "@/ai/flows/process-notes-flow"
import { Loader2, FileText, LayoutGrid, CheckSquare, Sparkles } from "lucide-react"

export default function NotesPage() {
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ProcessNotesOutput | null>(null)

  const handleProcess = async () => {
    if (!notes.trim()) return
    setIsLoading(true)
    try {
      const data = await processNotes({ notesContent: notes })
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
          <h1 className="font-headline font-bold text-xl">AI Notes Summarizer</h1>
        </header>

        <main className="p-6 space-y-6 max-w-5xl mx-auto w-full">
          {!result ? (
            <Card className="border-dashed border-2">
              <CardHeader>
                <CardTitle>Transform Your Notes</CardTitle>
                <CardDescription>Paste your study notes below to generate summaries, flashcards, and quizzes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  className="min-h-[300px] text-base" 
                  placeholder="Paste your notes here..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <Button 
                  className="w-full h-12 text-lg" 
                  onClick={handleProcess} 
                  disabled={isLoading || !notes}
                >
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Notes...</> : <><Sparkles className="mr-2 size-5" /> Process with AI</>}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-headline font-bold">Processed Results</h2>
                <Button variant="outline" onClick={() => setResult(null)}>New Notes</Button>
              </div>

              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-12 mb-8">
                  <TabsTrigger value="summary" className="gap-2"><FileText className="size-4" /> Summary</TabsTrigger>
                  <TabsTrigger value="flashcards" className="gap-2"><LayoutGrid className="size-4" /> Flashcards</TabsTrigger>
                  <TabsTrigger value="quiz" className="gap-2"><CheckSquare className="size-4" /> Smart Quiz</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none text-lg">
                      {result.summary}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="flashcards">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.flashcards.map((card, i) => (
                      <Card key={i} className="cursor-pointer hover:border-primary transition-all group overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-2">
                          <CardTitle className="text-sm text-primary uppercase font-bold">Question</CardTitle>
                        </CardHeader>
                        <CardContent className="py-6">
                          <p className="font-semibold text-lg">{card.front}</p>
                          <Separator className="my-4 group-hover:bg-primary/20" />
                          <p className="text-muted-foreground italic">"{card.back}"</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="quiz">
                  <div className="space-y-6">
                    {result.quizQuestions.map((q, i) => (
                      <Card key={i}>
                        <CardHeader>
                          <CardTitle className="text-lg">Q{i + 1}: {q.question}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt, j) => (
                              <Button key={j} variant="outline" className="justify-start h-auto py-3 px-4 whitespace-normal text-left">
                                {opt}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}