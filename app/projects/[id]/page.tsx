"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  PlusCircle,
  ExternalLink,
  DollarSign,
  FileText,
  Trash2,
  Upload,
  X,
  Edit,
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
  MessageSquare,
  Plus,
  BarChart3,
  Tag,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagInput } from "@/components/tag-input"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Check } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  releaseDate?: string
  competitorCount: number
  tags?: string[]
  comparisonCategories?: ComparisonCategory[]
}

interface ComparisonCategory {
  id: string
  name: string
}

interface PlayerReview {
  id: string
  username: string
  content: string
  rating: "positive" | "negative" | "mixed"
  date?: string
  playtime?: string
}

interface Competitor {
  id: string
  name: string
  url: string
  description: string
  screenshots: string[]
  notes: string
  estimatedRevenue: string
  retailPrice?: number | string
  tags: string[]
  projectId: string
  reviewCount?: number
  rating?: string
  order?: number
  releaseDate?: string
  playerReviews?: PlayerReview[]
  steamDbUrl?: string
  comparisons?: Record<string, string>
}

function SortableCompetitorCard({
  competitor,
  onEdit,
  onDelete,
  onViewReviews,
}: {
  competitor: Competitor
  onEdit: (competitor: Competitor) => void
  onDelete: (id: string) => void
  onViewReviews: (competitor: Competitor) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: competitor.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getRatingColor = (rating: string) => {
    const ratingMap: Record<string, string> = {
      "Overwhelmingly Positive": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      "Very Positive": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      Positive: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      "Mostly Positive": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
      Mixed: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      "Mostly Negative": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
      Negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      "Very Negative": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      "Overwhelmingly Negative": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    }

    return ratingMap[rating] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getRelativeTimeString = (dateString?: string) => {
    if (!dateString) return null

    const releaseDate = new Date(dateString)
    const now = new Date()
    const diffTime = releaseDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      return "To be released"
    }

    const diffYears = Math.floor(Math.abs(diffDays) / 365)
    const diffMonths = Math.floor((Math.abs(diffDays) % 365) / 30)
    const remainingDays = Math.abs(diffDays) % 30

    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? "s" : ""} ${diffMonths > 0 ? `${diffMonths} month${diffMonths > 1 ? "s" : ""}` : ""} ago`
    } else if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`
    } else {
      return `${remainingDays} day${remainingDays !== 1 ? "s" : ""} ago`
    }
  }

  const hasReviews = competitor.playerReviews && competitor.playerReviews.length > 0

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="touch-none">
      <Card className="overflow-hidden card-transition animate-slideIn cursor-grab active:cursor-grabbing">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex-1" {...listeners}>
              {competitor.name}
            </div>
            <div className="flex gap-1">
              {hasReviews && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewReviews(competitor)
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              )}
              {competitor.steamDbUrl && (
                <Link
                  href={competitor.steamDbUrl}
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              {competitor.url && (
                <Link href={competitor.url} target="_blank" className="text-muted-foreground hover:text-foreground">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid gap-4">
            {competitor.screenshots && competitor.screenshots.length > 0 && (
              <div className="relative aspect-video overflow-hidden rounded-md border">
                <Image
                  src={competitor.screenshots[0] || "/placeholder.svg"}
                  alt={`${competitor.name} screenshot`}
                  fill
                  className="object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
            )}

            <div>
              <p className="text-sm line-clamp-3">{competitor.description || "No description available."}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {competitor.rating && competitor.rating !== "None" && (
                <Badge className={`${getRatingColor(competitor.rating)}`}>{competitor.rating}</Badge>
              )}
              {competitor.reviewCount ? (
                <Badge variant="outline">{competitor.reviewCount.toLocaleString()} reviews</Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  No reviews
                </Badge>
              )}
            </div>

            {competitor.releaseDate && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Released: {formatDate(competitor.releaseDate)}</span>
                </div>
                <div className="text-xs text-muted-foreground ml-6">
                  {getRelativeTimeString(competitor.releaseDate)}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              {(competitor.retailPrice !== undefined && competitor.retailPrice !== "") && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {competitor.retailPrice === 0 || competitor.retailPrice === "0" ? (
                      <span className="font-medium text-green-600 dark:text-green-400">Free</span>
                    ) : (
                      <span>${competitor.retailPrice}</span>
                    )}
                  </span>
                </div>
              )}

              {competitor.estimatedRevenue && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-revenue" />
                  <span className="font-bold text-revenue">{competitor.estimatedRevenue}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {competitor.tags &&
                competitor.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
            </div>

            {competitor.notes && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm line-clamp-2">{competitor.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" onClick={() => onEdit(competitor)}>
            Edit Details
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive flex items-center gap-1"
            onClick={() => onDelete(competitor.id)}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function PlayerReviewItem({ review, onDelete }: { review: PlayerReview; onDelete: () => void }) {
  return (
    <div className="border rounded-md p-4 mb-4 relative">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium">{review.username}</span>
          <Badge
            variant="outline"
            className={
              review.rating === "positive"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : review.rating === "negative"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
            }
          >
            {review.rating.charAt(0).toUpperCase() + review.rating.slice(1)}
          </Badge>
          {review.playtime && <span className="text-xs">{review.playtime} hrs on record</span>}
          {review.date && <span className="text-xs text-muted-foreground">{review.date}</span>}
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 absolute top-2 right-2" onClick={onDelete}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm">{review.content}</p>
    </div>
  )
}

function ReviewsModal({ competitor, onClose }: { competitor: Competitor; onClose: () => void }) {
  const playerReviews = competitor.playerReviews || []

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Player Reviews for {competitor.name}</DialogTitle>
          <DialogDescription>Notable player reviews collected from the game's store page.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {playerReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No player reviews have been added yet.</div>
          ) : (
            <div className="space-y-4">
              {playerReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {review.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{review.username}</div>
                      <div className="text-xs text-muted-foreground flex gap-2">
                        {review.playtime && <span>{review.playtime} hrs on record</span>}
                        {review.date && <span>{review.date}</span>}
                      </div>
                    </div>
                    <Badge
                      className={
                        review.rating === "positive"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 ml-auto"
                          : review.rating === "negative"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 ml-auto"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 ml-auto"
                      }
                    >
                      {review.rating.charAt(0).toUpperCase() + review.rating.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm mt-2">{review.content}</div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [project, setProject] = useState<Project | null>(null)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [filteredCompetitors, setFilteredCompetitors] = useState<Competitor[]>([])
  const [newCompetitor, setNewCompetitor] = useState({
    name: "",
    url: "",
  })
  const [open, setOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [currentCompetitor, setCurrentCompetitor] = useState<Competitor | null>(null)
  const [competitorDetails, setCompetitorDetails] = useState({
    name: "",
    url: "",
    description: "",
    notes: "",
    estimatedRevenue: "",
    retailPrice: "",
    tags: [] as string[],
    reviewCount: "",
    rating: "Mixed",
    screenshots: [] as string[],
    releaseDate: "",
    playerReviews: [] as PlayerReview[],
    steamDbUrl: "",
    comparisons: {} as Record<string, string>,
  })
  const [projectTags, setProjectTags] = useState<string[]>([])
  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const [editedProject, setEditedProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [newReview, setNewReview] = useState({
    username: "Anonymous",
    content: "",
    rating: "positive" as "positive" | "negative" | "mixed",
    date: "",
    playtime: "",
  })
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false)
  const [selectedCompetitorForReviews, setSelectedCompetitorForReviews] = useState<Competitor | null>(null)
  const [comparisonCategories, setComparisonCategories] = useState<ComparisonCategory[]>([
    { id: "1", name: "What are the unique selling points of the game?" },
    { id: "2", name: "Which elements are shared with others?" },
    { id: "3", name: "Which languages are the game available in?" },
  ])
  const [newCategoryName, setNewCategoryName] = useState("")

  // Filtering and sorting
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [filterRating, setFilterRating] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const [deleteCompetitorId, setDeleteCompetitorId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  const [deleteCategoryConfirmOpen, setDeleteCategoryConfirmOpen] = useState(false)

  // Load project and competitors from localStorage
  useEffect(() => {
    const storedProjects = localStorage.getItem("gamecomp-projects")
    const storedCompetitors = localStorage.getItem("gamecomp-competitors")

    if (storedProjects) {
      const projects = JSON.parse(storedProjects)
      const currentProject = projects.find((p: Project) => p.id === projectId)

      if (currentProject) {
        setProject(currentProject)
        setEditedProject(currentProject)
        setProjectTags(currentProject.tags || [])

        // Load comparison categories if they exist
        if (currentProject.comparisonCategories && currentProject.comparisonCategories.length > 0) {
          setComparisonCategories(currentProject.comparisonCategories)
        }
      } else {
        router.push("/projects")
      }
    }

    if (storedCompetitors) {
      const allCompetitors = JSON.parse(storedCompetitors)
      const projectCompetitors = allCompetitors.filter((c: Competitor) => c.projectId === projectId)

      // Sort by order if available
      projectCompetitors.sort((a: Competitor, b: Competitor) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order
        }
        return 0
      })

      setCompetitors(projectCompetitors)
      setFilteredCompetitors(projectCompetitors)

      // Extract all unique tags from competitors
      const tags = new Set<string>()
      projectCompetitors.forEach((competitor: Competitor) => {
        competitor.tags?.forEach((tag) => tags.add(tag))
      })

      // Update project tags in state
      setProjectTags(Array.from(tags))
    }
  }, [projectId, router])

  // Update project competitor count and tags
  useEffect(() => {
    if (project) {
      const storedProjects = localStorage.getItem("gamecomp-projects")
      if (storedProjects) {
        const projects = JSON.parse(storedProjects)
        const updatedProjects = projects.map((p: Project) => {
          if (p.id === projectId) {
            return {
              ...p,
              competitorCount: competitors.length,
              tags: projectTags,
              comparisonCategories: comparisonCategories,
            }
          }
          return p
        })
        localStorage.setItem("gamecomp-projects", JSON.stringify(updatedProjects))

        // Dispatch custom event to update sidebar
        window.dispatchEvent(new Event("projectsUpdated"))
      }
    }
  }, [competitors.length, project, projectId, projectTags, comparisonCategories])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...competitors]

    // Apply tag filters (multiple - AND logic)
    if (filterTags.length > 0) {
      result = result.filter((c) => {
        // A competitor matches if it has ALL of the selected tags
        return filterTags.every((tag) => c.tags?.includes(tag))
      })
    }

    // Apply rating filter - group similar ratings
    if (filterRating) {
      result = result.filter((c) => {
        if (filterRating === "positive") {
          return c.rating?.includes("Positive")
        } else if (filterRating === "negative") {
          return c.rating?.includes("Negative")
        } else if (filterRating === "mixed") {
          return c.rating === "Mixed"
        }
        return true
      })
    }

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        let valueA, valueB

        switch (sortBy) {
          case "name":
            valueA = a.name.toLowerCase()
            valueB = b.name.toLowerCase()
            break
          case "releaseDate":
            valueA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
            valueB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
            break
          case "reviewCount":
            valueA = a.reviewCount || 0
            valueB = b.reviewCount || 0
            break
          case "revenue":
            // Simple revenue comparison (not perfect but works for basic sorting)
            valueA = a.estimatedRevenue ? a.estimatedRevenue.replace(/[^0-9]/g, "") : "0"
            valueB = b.estimatedRevenue ? b.estimatedRevenue.replace(/[^0-9]/g, "") : "0"
            break
          case "retailPrice":
            valueA = Number.parseFloat(a.retailPrice as string) || 0
            valueB = Number.parseFloat(b.retailPrice as string) || 0
            break
          default:
            valueA = a.name.toLowerCase()
            valueB = b.name.toLowerCase()
        }

        if (sortDirection === "asc") {
          return valueA > valueB ? 1 : -1
        } else {
          return valueA < valueB ? 1 : -1
        }
      })
    }

    setFilteredCompetitors(result)
  }, [competitors, filterTags, filterRating, sortBy, sortDirection])

  const handleAddCompetitor = () => {
    if (!newCompetitor.name.trim()) return

    const competitor: Competitor = {
      id: Date.now().toString(),
      name: newCompetitor.name,
      url: newCompetitor.url,
      description: "",
      screenshots: ["/placeholder.svg?height=300&width=500"],
      notes: "",
      estimatedRevenue: "",
      retailPrice: "",
      tags: [],
      projectId,
      order: competitors.length,
      playerReviews: [],
      steamDbUrl: "",
      comparisons: {},
    }

    // Save to localStorage
    const storedCompetitors = localStorage.getItem("gamecomp-competitors")
    let allCompetitors = []

    if (storedCompetitors) {
      allCompetitors = JSON.parse(storedCompetitors)
    }

    allCompetitors.push(competitor)
    localStorage.setItem("gamecomp-competitors", JSON.stringify(allCompetitors))

    setCompetitors([...competitors, competitor])
    setNewCompetitor({
      name: "",
      url: "",
    })
    setOpen(false)

    // Set current competitor for details dialog
    setCurrentCompetitor(competitor)
    setCompetitorDetails({
      name: competitor.name,
      url: competitor.url,
      description: "",
      notes: "",
      estimatedRevenue: "",
      retailPrice: "",
      tags: [],
      reviewCount: "",
      rating: "None",
      screenshots: competitor.screenshots,
      releaseDate: "",
      playerReviews: [],
      steamDbUrl: "",
      comparisons: {},
    })
    setDetailsOpen(true)
    setActiveTab("basic")
  }

  const handleSaveDetails = () => {
    if (!currentCompetitor) return

    const updatedCompetitor = {
      ...currentCompetitor,
      name: competitorDetails.name,
      url: competitorDetails.url,
      description: competitorDetails.description,
      notes: competitorDetails.notes,
      estimatedRevenue: competitorDetails.estimatedRevenue,
      retailPrice: competitorDetails.retailPrice,
      tags: competitorDetails.tags,
      reviewCount: Number.parseInt(competitorDetails.reviewCount) || 0,
      rating: competitorDetails.rating,
      screenshots: competitorDetails.screenshots,
      releaseDate: competitorDetails.releaseDate,
      playerReviews: competitorDetails.playerReviews,
      steamDbUrl: competitorDetails.steamDbUrl,
      comparisons: competitorDetails.comparisons,
    }

    // Update in localStorage
    const storedCompetitors = localStorage.getItem("gamecomp-competitors")
    if (storedCompetitors) {
      const allCompetitors = JSON.parse(storedCompetitors)
      const updatedCompetitors = allCompetitors.map((c: Competitor) =>
        c.id === currentCompetitor.id ? updatedCompetitor : c,
      )
      localStorage.setItem("gamecomp-competitors", JSON.stringify(updatedCompetitors))
    }

    // Update in state
    setCompetitors(competitors.map((c) => (c.id === currentCompetitor.id ? updatedCompetitor : c)))

    // Update project tags
    const newTags = new Set([...projectTags, ...competitorDetails.tags])
    setProjectTags(Array.from(newTags))

    setDetailsOpen(false)
  }

  const handleDeleteCompetitor = (id: string) => {
    setDeleteCompetitorId(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteCompetitor = () => {
    if (!deleteCompetitorId) return

    // Delete from localStorage
    const storedCompetitors = localStorage.getItem("gamecomp-competitors")
    if (storedCompetitors) {
      const allCompetitors = JSON.parse(storedCompetitors)
      const updatedCompetitors = allCompetitors.filter((c: Competitor) => c.id !== deleteCompetitorId)
      localStorage.setItem("gamecomp-competitors", JSON.stringify(updatedCompetitors))
    }

    // Delete from state
    setCompetitors(competitors.filter((c) => c.id !== deleteCompetitorId))
    setFilteredCompetitors(filteredCompetitors.filter((c) => c.id !== deleteCompetitorId))

    setDeleteConfirmOpen(false)
    setDeleteCompetitorId(null)
  }

  const handleEditCompetitor = (competitor: Competitor) => {
    setCurrentCompetitor(competitor)
    setCompetitorDetails({
      name: competitor.name || "",
      url: competitor.url || "",
      description: competitor.description || "",
      notes: competitor.notes || "",
      estimatedRevenue: competitor.estimatedRevenue || "",
      retailPrice: competitor.retailPrice?.toString() || "",
      tags: competitor.tags || [],
      reviewCount: competitor.reviewCount?.toString() || "",
      rating: competitor.rating || "None",
      screenshots: competitor.screenshots || [],
      releaseDate: competitor.releaseDate || "",
      playerReviews: competitor.playerReviews || [],
      steamDbUrl: competitor.steamDbUrl || "",
      comparisons: competitor.comparisons || {},
    })
    setDetailsOpen(true)
    setActiveTab("basic")
  }

  const handleViewReviews = (competitor: Competitor) => {
    setSelectedCompetitorForReviews(competitor)
    setReviewsModalOpen(true)
  }

  const handleAddTag = (tag: string) => {
    if (!projectTags.includes(tag)) {
      setProjectTags([...projectTags, tag])
    }
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setCompetitors((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const reordered = arrayMove(items, oldIndex, newIndex)

        // Update order property
        const withUpdatedOrder = reordered.map((item, index) => ({
          ...item,
          order: index,
        }))

        // Save to localStorage
        const storedCompetitors = localStorage.getItem("gamecomp-competitors")
        if (storedCompetitors) {
          const allCompetitors = JSON.parse(storedCompetitors)
          const updatedCompetitors = allCompetitors.map((c: Competitor) => {
            const found = withUpdatedOrder.find((item) => item.id === c.id)
            return found || c
          })
          localStorage.setItem("gamecomp-competitors", JSON.stringify(updatedCompetitors))
        }

        return withUpdatedOrder
      })
    }
  }

  const handleAddScreenshot = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // TODO: upload the file to a server / save to some kind of database
    // For now, just create a placeholder URL
    const file = files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const newScreenshots = [...competitorDetails.screenshots, event.target.result.toString()]
        setCompetitorDetails({
          ...competitorDetails,
          screenshots: newScreenshots,
        })
      }
    }

    reader.readAsDataURL(file)

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveScreenshot = (index: number) => {
    if (currentCompetitor) {
      const newScreenshots = [...competitorDetails.screenshots]
      newScreenshots.splice(index, 1)
      setCompetitorDetails({
        ...competitorDetails,
        screenshots: newScreenshots,
      })
    }
  }

  const handleSaveProject = () => {
    if (!editedProject) return

    // Update in localStorage
    const storedProjects = localStorage.getItem("gamecomp-projects")
    if (storedProjects) {
      const projects = JSON.parse(storedProjects)
      const updatedProjects = projects.map((p: Project) => (p.id === projectId ? editedProject : p))
      localStorage.setItem("gamecomp-projects", JSON.stringify(updatedProjects))
    }

    setProject(editedProject)
    setEditProjectOpen(false)
  }

  const clearFilters = () => {
    setFilterTags([])
    setFilterRating(null)
    setSortBy(null)
    setSortDirection("asc")
  }

  const handleAddReview = () => {
    if (!newReview.username.trim() || !newReview.content.trim()) return

    const review: PlayerReview = {
      id: Date.now().toString(),
      username: newReview.username,
      content: newReview.content,
      rating: newReview.rating,
      date: newReview.date || undefined,
      playtime: newReview.playtime || undefined,
    }

    const updatedReviews = [...competitorDetails.playerReviews, review]
    setCompetitorDetails({
      ...competitorDetails,
      playerReviews: updatedReviews,
    })

    // Reset form
    setNewReview({
      username: "Anonymous",
      content: "",
      rating: "positive",
      date: "",
      playtime: "",
    })
  }

  const handleDeleteReview = (reviewId: string) => {
    const updatedReviews = competitorDetails.playerReviews.filter((r) => r.id !== reviewId)
    setCompetitorDetails({
      ...competitorDetails,
      playerReviews: updatedReviews,
    })
  }

  const toggleTagFilter = (tag: string) => {
    if (filterTags.includes(tag)) {
      setFilterTags(filterTags.filter((t) => t !== tag))
    } else {
      setFilterTags([...filterTags, tag])
    }
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return

    const newCategory: ComparisonCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
    }

    setComparisonCategories([...comparisonCategories, newCategory])
    setNewCategoryName("")
  }

  const handleDeleteCategory = (id: string) => {
    setDeleteCategoryId(id)
    setDeleteCategoryConfirmOpen(true)
  }

  const confirmDeleteCategory = () => {
    if (!deleteCategoryId) return

    setComparisonCategories(comparisonCategories.filter((c) => c.id !== deleteCategoryId))

    // Also remove this category from all competitors' comparisons
    const updatedCompetitors = competitors.map((competitor) => {
      const updatedComparisons = { ...competitor.comparisons }
      if (updatedComparisons && deleteCategoryId in updatedComparisons) {
        delete updatedComparisons[deleteCategoryId]
      }
      return {
        ...competitor,
        comparisons: updatedComparisons,
      }
    })

    setCompetitors(updatedCompetitors)

    // Update in localStorage
    const storedCompetitors = localStorage.getItem("gamecomp-competitors")
    if (storedCompetitors) {
      const allCompetitors = JSON.parse(storedCompetitors)
      const updatedAllCompetitors = allCompetitors.map((c: Competitor) => {
        if (c.projectId === projectId) {
          const updatedComparisons = { ...c.comparisons }
          if (updatedComparisons && deleteCategoryId in updatedComparisons) {
            delete updatedComparisons[deleteCategoryId]
          }
          return {
            ...c,
            comparisons: updatedComparisons,
          }
        }
        return c
      })
      localStorage.setItem("gamecomp-competitors", JSON.stringify(updatedAllCompetitors))
    }

    setDeleteCategoryId(null)
    setDeleteCategoryConfirmOpen(false)
  }

  const handleComparisonChange = (categoryId: string, value: string) => {
    setCompetitorDetails({
      ...competitorDetails,
      comparisons: {
        ...competitorDetails.comparisons,
        [categoryId]: value,
      },
    })
  }

  if (!project) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      <div className="mb-8">
        <div className={`flex justify-between items-center ${competitors.length === 0 ? "mb-8" : ""}`}>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-1">{project.description}</p>
            {project.releaseDate && (
              <p className="text-sm mt-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Planned release: {new Date(project.releaseDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditedProject(project)
                setEditProjectOpen(true)
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 animate-fadeIn">
                  <PlusCircle className="h-5 w-5" />
                  Add Competitor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add a competitor</DialogTitle>
                  <DialogDescription>Start by adding basic information about the competing game.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Game Name</Label>
                    <Input
                      id="name"
                      value={newCompetitor.name}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                      placeholder="e.g., Stardew Valley"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url">Store URL (optional)</Label>
                    <Input
                      id="url"
                      value={newCompetitor.url}
                      onChange={(e) => setNewCompetitor({ ...newCompetitor, url: e.target.value })}
                      placeholder="e.g., https://store.steampowered.com/app/..."
                    />
                    <p className="text-xs text-muted-foreground">Add a link to Steam, Itch.io, or other storefront</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddCompetitor}>Add & Continue</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={editProjectOpen} onOpenChange={setEditProjectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
            <DialogDescription>Update your project details.</DialogDescription>
          </DialogHeader>
          {editedProject && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Project Name</Label>
                <Input
                  id="edit-name"
                  value={editedProject.name}
                  onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                  placeholder="e.g., RPG Market Analysis"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editedProject.description}
                  onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                  placeholder="What's this project about?"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-releaseDate">Planned Release Date</Label>
                <Input
                  id="edit-releaseDate"
                  type="date"
                  value={editedProject.releaseDate || ""}
                  onChange={(e) => setEditedProject({ ...editedProject, releaseDate: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProjectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProject}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit competitor details</DialogTitle>
            <DialogDescription>Edit information about {currentCompetitor?.name}</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="advanced">Details</TabsTrigger>
              <TabsTrigger value="reviews">Player Reviews</TabsTrigger>
              <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4">
              <ScrollArea className="h-[60vh] pr-4">
                <div className="grid gap-4 p-1">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Game Name</Label>
                    <Input
                      id="name"
                      value={competitorDetails.name}
                      onChange={(e) => setCompetitorDetails({ ...competitorDetails, name: e.target.value })}
                      placeholder="e.g., Stardew Valley"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url">Store URL (optional)</Label>
                    <Input
                      id="url"
                      value={competitorDetails.url}
                      onChange={(e) => setCompetitorDetails({ ...competitorDetails, url: e.target.value })}
                      placeholder="e.g., https://store.steampowered.com/app/..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="steamDbUrl">SteamDB URL (optional)</Label>
                    <Input
                      id="steamDbUrl"
                      value={competitorDetails.steamDbUrl}
                      onChange={(e) => setCompetitorDetails({ ...competitorDetails, steamDbUrl: e.target.value })}
                      placeholder="e.g., https://steamdb.info/app/..."
                    />
                    <p className="text-xs text-muted-foreground">Add a link to SteamDB or other analytics sites.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={competitorDetails.description}
                      onChange={(e) => setCompetitorDetails({ ...competitorDetails, description: e.target.value })}
                      placeholder="Game description"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="releaseDate">Release Date</Label>
                    <Input
                      id="releaseDate"
                      type="date"
                      value={competitorDetails.releaseDate}
                      onChange={(e) => setCompetitorDetails({ ...competitorDetails, releaseDate: e.target.value })}
                    />
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="advanced" className="mt-4">
              <ScrollArea className="h-[60vh] pr-4">
                <div className="grid gap-4 p-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reviewCount">Number of Reviews</Label>
                      <Input
                        id="reviewCount"
                        type="number"
                        value={competitorDetails.reviewCount}
                        onChange={(e) => setCompetitorDetails({ ...competitorDetails, reviewCount: e.target.value })}
                        placeholder="e.g., 1500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="rating">Rating</Label>
                      <Select
                        value={competitorDetails.rating}
                        onValueChange={(value) => setCompetitorDetails({ ...competitorDetails, rating: value })}
                      >
                        <SelectTrigger id="rating">
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Overwhelmingly Positive">Overwhelmingly Positive</SelectItem>
                          <SelectItem value="Very Positive">Very Positive</SelectItem>
                          <SelectItem value="Positive">Positive</SelectItem>
                          <SelectItem value="Mostly Positive">Mostly Positive</SelectItem>
                          <SelectItem value="Mixed">Mixed</SelectItem>
                          <SelectItem value="Mostly Negative">Mostly Negative</SelectItem>
                          <SelectItem value="Negative">Negative</SelectItem>
                          <SelectItem value="Very Negative">Very Negative</SelectItem>
                          <SelectItem value="Overwhelmingly Negative">Overwhelmingly Negative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="retailPrice">Retail Price</Label>
                      <Input
                        id="retailPrice"
                        type="number"
                        step="0.01"
                        value={competitorDetails.retailPrice}
                        onChange={(e) => setCompetitorDetails({ ...competitorDetails, retailPrice: e.target.value })}
                        placeholder="e.g., 19.99"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="revenue">Estimated Revenue</Label>
                      <Input
                        id="revenue"
                        value={competitorDetails.estimatedRevenue}
                        onChange={(e) =>
                          setCompetitorDetails({ ...competitorDetails, estimatedRevenue: e.target.value })
                        }
                        placeholder="e.g., $1M-$5M"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Your Notes</Label>
                    <Textarea
                      id="notes"
                      value={competitorDetails.notes}
                      onChange={(e) => setCompetitorDetails({ ...competitorDetails, notes: e.target.value })}
                      placeholder="Your notes..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tags</Label>
                    <TagInput
                      value={competitorDetails.tags}
                      onChange={(tags) => setCompetitorDetails({ ...competitorDetails, tags })}
                      availableTags={projectTags}
                      onCreateTag={handleAddTag}
                      placeholder="Select or create tags..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Screenshots</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {competitorDetails.screenshots.map((screenshot, index) => (
                        <div key={index} className="relative aspect-video overflow-hidden rounded-md border group">
                          <Image
                            src={screenshot || "/placeholder.svg"}
                            alt={`Screenshot ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            className="absolute top-1 right-1 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveScreenshot(index)}
                            type="button"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                      <button
                        className="flex items-center justify-center aspect-video border border-dashed rounded-md hover:bg-muted/50 transition-colors"
                        onClick={handleAddScreenshot}
                        type="button"
                      >
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <ScrollArea className="h-[60vh] pr-4">
                <div className="grid gap-4 p-1">
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Add New Player Review</h3>
                    <div className="grid gap-3">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={newReview.username}
                          onChange={(e) => setNewReview({ ...newReview, username: e.target.value })}
                          placeholder="e.g., GameFan123"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rating">Sentiment</Label>
                        <Select
                          value={newReview.rating}
                          onValueChange={(value: "positive" | "negative" | "mixed") =>
                            setNewReview({ ...newReview, rating: value })
                          }
                        >
                          <SelectTrigger id="review-rating">
                            <SelectValue placeholder="Select sentiment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="review-date">Date (optional)</Label>
                          <Input
                            id="review-date"
                            type="date"
                            value={newReview.date}
                            onChange={(e) => setNewReview({ ...newReview, date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="playtime">Playtime (hrs)</Label>
                          <Input
                            id="playtime"
                            value={newReview.playtime}
                            onChange={(e) => setNewReview({ ...newReview, playtime: e.target.value })}
                            placeholder="e.g., 7.9"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="review-content">Review Content</Label>
                        <Textarea
                          id="review-content"
                          value={newReview.content}
                          onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                          placeholder="Enter the player's review..."
                          className="min-h-[100px]"
                        />
                      </div>
                      <Button onClick={handleAddReview} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Review
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Saved Reviews</h3>
                    <div>
                      {competitorDetails.playerReviews && competitorDetails.playerReviews.length > 0 ? (
                        competitorDetails.playerReviews.map((review) => (
                          <PlayerReviewItem
                            key={review.id}
                            review={review}
                            onDelete={() => handleDeleteReview(review.id)}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No player reviews added yet. Add your first review above.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="comparisons" className="mt-4">
              <ScrollArea className="h-[60vh] pr-4">
                <div className="grid gap-4 p-1">
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Comparison Categories</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      These categories are shared across all competitors in this project.
                    </p>

                    {comparisonCategories.map((category) => (
                      <div key={category.id} className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor={`comparison-${category.id}`} className="font-medium">
                            {category.name}
                          </Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          id={`comparison-${category.id}`}
                          value={competitorDetails.comparisons?.[category.id] || ""}
                          onChange={(e) => handleComparisonChange(category.id, e.target.value)}
                          placeholder={`Enter details about ${category.name.toLowerCase()}`}
                          className="min-h-[100px]"
                        />
                      </div>
                    ))}

                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2">Add New Category</h4>
                      <div className="flex gap-2">
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter new category name"
                          className="flex-1"
                        />
                        <Button onClick={handleAddCategory}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDetails}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the competitor and remove it from your project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCompetitor} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation Dialog */}
      <AlertDialog open={deleteCategoryConfirmOpen} onOpenChange={setDeleteCategoryConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comparison category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this category from all competitors in this project. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reviews Modal */}
      {reviewsModalOpen && selectedCompetitorForReviews && (
        <ReviewsModal
          competitor={selectedCompetitorForReviews}
          onClose={() => {
            setReviewsModalOpen(false)
            setSelectedCompetitorForReviews(null)
          }}
        />
      )}

      {competitors.length === 0 ? (
        <div className="text-center py-12 border rounded-lg animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <PlusCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium mb-4">No competitors yet</h2>
          <p className="text-muted-foreground mb-6 px-4">Add your first competitor to start your analysis.</p>
          <Button onClick={() => setOpen(true)}>Add a Competitor</Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                    {filterTags.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {filterTags.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Tags (multiple)</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {projectTags.map((tag) => (
                      <DropdownMenuItem
                        key={tag}
                        onClick={() => toggleTagFilter(tag)}
                        className={filterTags.includes(tag) ? "bg-muted" : ""}
                      >
                        {filterTags.includes(tag) ? <Check className="mr-2 h-4 w-4" /> : <span className="w-4 mr-2" />}
                        {tag}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Rating</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {["positive", "mixed", "negative"].map((rating) => (
                      <DropdownMenuItem
                        key={rating}
                        onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                        className={filterRating === rating ? "bg-muted" : ""}
                      >
                        {filterRating === rating ? <Check className="mr-2 h-4 w-4" /> : <span className="w-4 mr-2" />}
                        {rating.charAt(0).toUpperCase() + rating.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    {sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {[
                      { id: "name", label: "Name" },
                      { id: "releaseDate", label: "Release Date" },
                      { id: "reviewCount", label: "Review Count" },
                      { id: "retailPrice", label: "Retail Price" },
                      { id: "revenue", label: "Revenue" },
                    ].map((sortOption) => (
                      <DropdownMenuItem
                        key={sortOption.id}
                        onClick={() => {
                          if (sortBy === sortOption.id) {
                            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                          } else {
                            setSortBy(sortOption.id)
                            setSortDirection("asc")
                          }
                        }}
                        className={sortBy === sortOption.id ? "bg-muted" : ""}
                      >
                        {sortBy === sortOption.id ? (
                          sortDirection === "asc" ? (
                            <SortAsc className="mr-2 h-4 w-4" />
                          ) : (
                            <SortDesc className="mr-2 h-4 w-4" />
                          )
                        ) : (
                          <span className="w-4 mr-2" />
                        )}
                        {sortOption.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {(filterTags.length > 0 || filterRating || sortBy) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            {(filterTags.length > 0 || filterRating) && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredCompetitors.length} of {competitors.length} competitors
              </div>
            )}
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredCompetitors.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCompetitors.map((competitor) => (
                  <SortableCompetitorCard
                    key={competitor.id}
                    competitor={competitor}
                    onEdit={handleEditCompetitor}
                    onDelete={handleDeleteCompetitor}
                    onViewReviews={handleViewReviews}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  )
}
