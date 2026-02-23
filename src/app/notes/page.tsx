
"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { processNotes, type ProcessNotesOutput } from "@/ai/flows/process-notes-flow"
import { generateSpeech } from "@/ai/flows/text-to-speech"
import { Loader2, FileText, LayoutGrid, CheckSquare, Sparkles, FileUp, FileCode2, FileType, RotateCcw, CheckCircle2, XCircle, Trophy, Volume2, PlayCircle, PauseCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function NotesPage() {
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [result, setResult] = useState<ProcessNotesOutput | null>(null)
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({})
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  
  // Audio state
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const awardXP = (amount: number) => {
    const currentXP = parseInt(localStorage.getItem("studywise-xp") || "0")
    localStorage.setItem("studywise-xp", (currentXP + amount).toString())
  }

  const handleProcess = async () => {
    if (!notes.trim()) return
    setIsLoading(true)
    setAudioUrl(null)
    try {
      const data = await processNotes({ notesContent: notes })
      setResult(data)
      setFlippedCards({})
      setQuizAnswers({})
      awardXP(50)
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not process the content. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleListen = async () => {
    if (!result?.summary) return
    setIsGeneratingAudio(true)
    try {
      const { audioDataUri } = await generateSpeech({ text: result.summary })
      setAudioUrl(audioDataUri)
      awardXP(10)
      toast({
        title: "Audio Ready",
        description: "Listening mode activated! (+10 XP)"
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Audio Generation Failed",
        description: "Could not convert text to speech."
      })
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const handleFileUpload = (type: 'pdf' | 'ppt' | 'doc') => {
    setIsParsing(true)
    setTimeout(() => {
      setIsParsing(false)
      const mockText = `This is a simulated extraction from a ${type.toUpperCase()} file.
      Key Concepts:
      - Advanced Study Strategies: Active Recall & Spaced Repetition.
      - Cornell Note Taking: Record, Questions, Recite, Reflect, Review.
      - Memory Palaces: Spatial mnemonic techniques for large data.
      
      Study Summary:
      Scientific research shows that testing yourself (active recall) is significantly more effective than re-reading notes. It strengthens neural pathways and improves long-term retention.`
      setNotes(mockText)
      awardXP(30)
      toast({
        title: "File Processed",
        description: `Successfully extracted text from your ${type.toUpperCase()} document. (+30 XP)`
      })
    }, 2000)
  }

  const toggleCard = (index: number) => {
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }))
    if (!flippedCards[index]) awardXP(5)
  }

  const handleQuizAnswer = (qIdx: number, opt: string, correctAns: string) => {
    if (quizAnswers[qIdx]) return
    setQuizAnswers(prev => ({ ...prev, [qIdx]: opt }))
    if (opt === correctAns) {
      awardXP(25)
      toast({
        title: "Correct Answer!",
        description: "You've earned 25 XP.",
      })
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:bg-muted/50 transition-all border-red-100 hover:border-red-300 shadow-sm" onClick={() => handleFileUpload('pdf')}>
                  <CardContent className="pt-6 flex flex-col items-center gap-2">
                    <FileType className="size-8 text-red-500" />
                    <span className="font-medium">Upload PDF</span>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-muted/50 transition-all border-orange-100 hover:border-orange-300 shadow-sm" onClick={() => handleFileUpload('ppt')}>
                  <CardContent className="pt-6 flex flex-col items-center gap-2">
                    <FileUp className="size-8 text-orange-500" />
                    <span className="font-medium">Upload PPT</span>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-muted/50 transition-all border-blue-100 hover:border-blue-300 shadow-sm" onClick={() => handleFileUpload('doc')}>
                  <CardContent className="pt-6 flex flex-col items-center gap-2">
                    <FileCode2 className="size-8 text-blue-500" />
                    <span className="font-medium">Upload Word</span>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-dashed border-2 shadow-none bg-muted/20">
                <CardHeader>
                  <CardTitle>Transform Your Notes</CardTitle>
                  <CardDescription>Paste text or upload files to generate summaries, interactive flashcards, and smart quizzes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Textarea 
                      className="min-h-[300px] text-base shadow-sm" 
                      placeholder="Paste your notes here..." 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    {isParsing && (
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-md animate-in fade-in backdrop-blur-sm">
                        <Loader2 className="size-8 animate-spin text-primary mb-2" />
                        <p className="font-medium">Parsing document content...</p>
                      </div>
                    )}
                  </div>
                  <Button 
                    className="w-full h-12 text-lg shadow-lg" 
                    onClick={handleProcess} 
                    disabled={isLoading || isParsing || !notes}
                  >
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="mr-2 size-5" /> Generate Insights</>}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-headline font-bold">Analysis Results</h2>
                <Button variant="outline" onClick={() => setResult(null)}>Start New Analysis</Button>
              </div>

              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-12 mb-8 p-1 bg-muted/50 rounded-xl">
                  <TabsTrigger value="summary" className="gap-2 rounded-lg"><FileText className="size-4" /> Summary</TabsTrigger>
                  <TabsTrigger value="flashcards" className="gap-2 rounded-lg"><LayoutGrid className="size-4" /> Flashcards</TabsTrigger>
                  <TabsTrigger value="quiz" className="gap-2 rounded-lg"><CheckSquare className="size-4" /> Smart Quiz</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-6">
                  <Card className="shadow-sm border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Key Summary</CardTitle>
                      {!audioUrl ? (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="gap-2" 
                          onClick={handleListen}
                          disabled={isGeneratingAudio}
                        >
                          {isGeneratingAudio ? <Loader2 className="size-3.5 animate-spin" /> : <Volume2 className="size-3.5" />}
                          Listen to Summary
                        </Button>
                      ) : (
                        <Badge className="bg-green-500 hover:bg-green-600 gap-1"><Volume2 className="size-3" /> Audio Generated</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {audioUrl && (
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                          <p className="text-xs font-bold text-primary uppercase flex items-center gap-2">
                            <Volume2 className="size-3" /> Audio Study Player
                          </p>
                          <audio controls className="w-full h-10">
                            <source src={audioUrl} type="audio/wav" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                      <div className="prose max-w-none text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {result.summary}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="flashcards">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.flashcards.map((card, i) => (
                      <div key={i} className="group h-[200px] [perspective:1000px]">
                        <div 
                          className={cn(
                            "relative h-full w-full rounded-xl transition-all duration-500 [transform-style:preserve-3d] cursor-pointer shadow-sm border",
                            flippedCards[i] ? "[transform:rotateY(180deg)]" : ""
                          )}
                          onClick={() => toggleCard(i)}
                        >
                          {/* Front */}
                          <div className="absolute inset-0 flex flex-col p-6 [backface-visibility:hidden]">
                            <p className="text-xs font-bold text-primary uppercase mb-2">Front</p>
                            <p className="text-xl font-bold flex-1 flex items-center">{card.front}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4">
                              <RotateCcw className="size-3" /> Click to flip
                            </div>
                          </div>
                          {/* Back */}
                          <div className="absolute inset-0 h-full w-full rounded-xl bg-primary text-primary-foreground p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                            <p className="text-xs font-bold uppercase mb-2 opacity-70">Back</p>
                            <p className="text-lg leading-relaxed">{card.back}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="quiz">
                  <div className="space-y-6">
                    {result.quizQuestions.map((q, i) => (
                      <Card key={i} className="shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg flex gap-3">
                            <span className="flex items-center justify-center size-7 rounded-full bg-primary/10 text-primary text-sm shrink-0">Q{i+1}</span>
                            {q.question}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt, j) => {
                              const isSelected = quizAnswers[i] === opt
                              const isCorrect = opt === q.correctAnswer
                              return (
                                <Button 
                                  key={j} 
                                  variant={isSelected ? (isCorrect ? "default" : "destructive") : "outline"} 
                                  className={cn(
                                    "justify-start h-auto py-3 px-4 whitespace-normal text-left transition-all",
                                    isSelected && isCorrect ? "bg-green-600 hover:bg-green-700" : ""
                                  )}
                                  onClick={() => handleQuizAnswer(i, opt, q.correctAnswer)}
                                  disabled={!!quizAnswers[i]}
                                >
                                  {isSelected && (isCorrect ? <CheckCircle2 className="size-4 mr-2" /> : <XCircle className="size-4 mr-2" />)}
                                  {opt}
                                </Button>
                              )
                            })}
                          </div>
                          {quizAnswers[i] && (
                            <div className={cn(
                              "mt-4 p-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 flex justify-between items-center",
                              quizAnswers[i] === q.correctAnswer ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                            )}>
                              <span>{quizAnswers[i] === q.correctAnswer ? "Correct! Great job." : `Incorrect. The correct answer is: ${q.correctAnswer}`}</span>
                              {quizAnswers[i] === q.correctAnswer && <Badge variant="secondary" className="gap-1 bg-green-200"><Trophy className="size-3" /> +25 XP</Badge>}
                            </div>
                          )}
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
