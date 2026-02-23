"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, BookOpen } from "lucide-react"

interface WorkspaceNote {
  id: string
  title: string
  content: string
  date: string
  subjectName: string
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [allNotes, setAllNotes] = useState<WorkspaceNote[]>([])
  
  useEffect(() => {
    const savedWs = localStorage.getItem("studywise-workspaces")
    if (savedWs) {
      const parsed = JSON.parse(savedWs)
      const flattened = parsed.flatMap((ws: any) => 
        ws.notes.map((note: any) => ({
          ...note,
          subjectName: ws.name
        }))
      )
      setAllNotes(flattened)
    }
  }, [])

  const filteredNotes = allNotes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-headline font-bold text-xl">Global Repository Search</h1>
        </header>

        <main className="p-6 space-y-6 max-w-5xl mx-auto w-full">
          <div className="relative group">
            <Input 
              className="h-14 pl-12 text-lg rounded-2xl shadow-lg border-primary/20 focus-visible:ring-primary"
              placeholder="Search across all subjects and notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              {searchQuery ? `Search Results (${filteredNotes.length})` : `All Stored Knowledge (${allNotes.length})`}
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {filteredNotes.map((note) => (
                <Card key={note.id} className="shadow-sm hover:border-primary/30 transition-all group overflow-hidden">
                  <CardHeader className="pb-2 space-y-0 flex flex-row items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="size-3.5 text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-tight">{note.subjectName}</span>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">{note.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[10px] opacity-60">{note.date}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
              
              {filteredNotes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 bg-muted/5 rounded-2xl border-2 border-dashed">
                  <FileText className="size-16 text-muted-foreground opacity-10 mb-4" />
                  <p className="text-muted-foreground font-medium">No notes found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
