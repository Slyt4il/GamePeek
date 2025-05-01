"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { FolderKanban, Home, BarChart3, Settings, PlusCircle, ChevronDown } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Project {
  id: string
  name: string
}

export function AppSidebar() {
  const pathname = usePathname()
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const storedProjects = localStorage.getItem("gamecomp-projects")
    if (storedProjects) {
      const parsedProjects = JSON.parse(storedProjects)
      setProjects(parsedProjects.map((p: any) => ({ id: p.id, name: p.name })))
    }
  }, [])

  // Update projects when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedProjects = localStorage.getItem("gamecomp-projects")
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects)
        setProjects(parsedProjects.map((p: any) => ({ id: p.id, name: p.name })))
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for project updates
    window.addEventListener("projectsUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("projectsUpdated", handleStorageChange)
    }
  }, [])

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <FolderKanban className="h-6 w-6" />
          <span className="font-bold text-xl">GamePeek</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"} size="lg" className="text-base">
                  <Link href="/" className="flex items-center gap-3">
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/projects" || pathname.startsWith("/projects/")}
                  size="lg"
                  className="text-base"
                >
                  <Link href="/projects" className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5" />
                    <span>All Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-base">
                <span>Your Projects</span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="gap-2 mt-2">
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <SidebarMenuItem key={project.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            pathname === `/projects/${project.id}` || pathname.startsWith(`/projects/${project.id}/`)
                          }
                          size="lg"
                          className="text-base"
                        >
                          <Link href={`/projects/${project.id}`} className="flex items-center">
                            <span>{project.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  ) : (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild size="lg" className="text-base">
                        <Link href="/projects" className="flex items-center gap-3">
                          <PlusCircle className="h-5 w-5" />
                          <span>Create Project</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 hidden">
        <div className="flex items-center justify-between">
          <Link
            href="/settings"
            className={`text-sm ${pathname === "/settings" ? "text-foreground font-medium" : "text-muted-foreground"} hover:text-foreground`}
          >
            <Settings className="h-4 w-4 inline mr-2" />
            Settings
          </Link>
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
