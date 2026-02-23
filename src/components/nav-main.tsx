"use client"

import {
  BookOpen,
  Calendar,
  LayoutDashboard,
  BrainCircuit,
  FileText,
  LineChart,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "AI Study Planner",
    url: "/planner",
    icon: Calendar,
  },
  {
    title: "AI Doubt Solver",
    url: "/solver",
    icon: BrainCircuit,
  },
  {
    title: "AI Notes Summarizer",
    url: "/notes",
    icon: FileText,
  },
  {
    title: "Weakness Tracker",
    url: "/weaknesses",
    icon: LineChart,
  },
]

export function NavMain() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.url}
              tooltip={item.title}
            >
              <Link href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}