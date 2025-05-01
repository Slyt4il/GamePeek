"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, FolderOpen, Calendar, Trash2, Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  releaseDate?: string
  competitorCount: number
  tags?: string[]
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [newProject, setNewProject] = useState({ name: "", description: "", releaseDate: "" })
  const [open, setOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Load projects from localStorage on component mount
  useEffect(() => {
    const storedProjects = localStorage.getItem("gamecomp-projects")
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects))
    }
  }, [])

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("gamecomp-projects", JSON.stringify(projects))

    // Dispatch custom event to update sidebar
    window.dispatchEvent(new Event("projectsUpdated"))
  }, [projects])

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      releaseDate: newProject.releaseDate || "",
      createdAt: new Date().toISOString(),
      competitorCount: 0,
      tags: [],
    }

    setProjects([...projects, project])
    setNewProject({ name: "", description: "", releaseDate: "" })
    setOpen(false)
  }

  const handleEditProject = () => {
    if (!editProject || !editProject.name.trim()) return

    setProjects(projects.map((p) => (p.id === editProject.id ? editProject : p)))
    setEditProject(null)
    setEditOpen(false)
  }

  const handleDeleteProject = (id: string) => {
    setDeleteProjectId(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteProject = () => {
    if (!deleteProjectId) return

    setProjects(projects.filter((project) => project.id !== deleteProjectId))
    setDeleteProjectId(null)
    setDeleteConfirmOpen(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 animate-fadeIn">
              <PlusCircle className="h-5 w-5" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new project</DialogTitle>
              <DialogDescription>Add a new competitive analysis project to track game competitors.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g., RPG Market Analysis"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="What's this project about?"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="releaseDate">Planned Release Date</Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={newProject.releaseDate}
                  onChange={(e) => setNewProject({ ...newProject, releaseDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
            <DialogDescription>Update your project details.</DialogDescription>
          </DialogHeader>
          {editProject && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Project Name</Label>
                <Input
                  id="edit-name"
                  value={editProject.name}
                  onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                  placeholder="e.g., RPG Market Analysis"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editProject.description}
                  onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                  placeholder="What's this project about?"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-releaseDate">Planned Release Date</Label>
                <Input
                  id="edit-releaseDate"
                  type="date"
                  value={editProject.releaseDate || ""}
                  onChange={(e) => setEditProject({ ...editProject, releaseDate: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProject}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project and all its competitors.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProject} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {projects.length === 0 ? (
        <div className="text-center py-12 border rounded-lg animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium mb-4">No projects yet</h2>
          <p className="text-muted-foreground mb-6 px-4">
            Create your first competitive analysis project to get started.
          </p>
          <Button onClick={() => setOpen(true)}>Create a Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Card
              key={project.id}
              className="overflow-hidden card-transition animate-slideIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Created on {formatDate(project.createdAt)}
                </div>
                {project.releaseDate && (
                  <div className="mt-2 text-sm">Planned release: {formatDate(project.releaseDate)}</div>
                )}
                <div className="mt-2 text-sm">{project.competitorCount} competitors</div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/projects/${project.id}`}>
                  <Button variant="outline">View Details</Button>
                </Link>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditProject(project)
                      setEditOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
