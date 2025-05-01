"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ExternalLink, Upload, TagIcon, DollarSign } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Competitor {
  id: string
  name: string
  url: string
  description: string
  screenshots: string[]
  notes: string
  estimatedRevenue: string
  tags: string[]
  projectId: string
}

export default function CompetitorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const competitorId = params.competitorId as string

  const [competitor, setCompetitor] = useState<Competitor | null>(null)
  const [editedCompetitor, setEditedCompetitor] = useState<Competitor | null>(null)
  const [tagsInput, setTagsInput] = useState("")

  // Load competitor from localStorage
  useEffect(() => {
    const storedCompetitors = localStorage.getItem("gamecomp-competitors")

    if (storedCompetitors) {
      const allCompetitors = JSON.parse(storedCompetitors)
      const currentCompetitor = allCompetitors.find(
        (c: Competitor) => c.id === competitorId && c.projectId === projectId,
      )

      if (currentCompetitor) {
        setCompetitor(currentCompetitor)
        setEditedCompetitor(currentCompetitor)
        setTagsInput(currentCompetitor.tags.join(", "))
      } else {
        router.push(`/projects/${projectId}`)
      }
    }
  }, [competitorId, projectId, router])

  const handleSaveChanges = () => {
    if (!editedCompetitor) return

    const storedCompetitors = localStorage.getItem("gamecomp-competitors")

    if (storedCompetitors) {
      const allCompetitors = JSON.parse(storedCompetitors)
      const updatedCompetitors = allCompetitors.map((c: Competitor) => {
        if (c.id === competitorId) {
          return {
            ...editedCompetitor,
            tags: tagsInput
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag),
          }
        }
        return c
      })

      localStorage.setItem("gamecomp-competitors", JSON.stringify(updatedCompetitors))
      setCompetitor({
        ...editedCompetitor,
        tags: tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      })
    }
  }

  if (!competitor || !editedCompetitor) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href={`/projects/${projectId}`}
          className="flex items-center text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{competitor.name}</h1>
          <Link href={competitor.url} target="_blank">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View on Store
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Screenshots</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {competitor.screenshots.map((screenshot, index) => (
                      <div key={index} className="relative aspect-video overflow-hidden rounded-md border">
                        <Image
                          src={screenshot || "/placeholder.svg"}
                          alt={`${competitor.name} screenshot ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    <div className="flex items-center justify-center border border-dashed rounded-md aspect-video p-4">
                      <Button variant="ghost" className="flex flex-col items-center gap-2 h-auto">
                        <Upload className="h-8 w-8" />
                        <span>Upload Screenshot</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">Description</h2>
                  <Textarea
                    value={editedCompetitor.description}
                    onChange={(e) => setEditedCompetitor({ ...editedCompetitor, description: e.target.value })}
                    className="min-h-[150px]"
                    placeholder="Enter the game's description here..."
                  />
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-4">Your Analysis Notes</h2>
                  <Textarea
                    value={editedCompetitor.notes}
                    onChange={(e) => setEditedCompetitor({ ...editedCompetitor, notes: e.target.value })}
                    className="min-h-[200px]"
                    placeholder="Add your analysis, observations, and competitive insights here..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Details</h2>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Game Name</Label>
                      <Input
                        id="name"
                        value={editedCompetitor.name}
                        onChange={(e) => setEditedCompetitor({ ...editedCompetitor, name: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="url">Store URL</Label>
                      <Input
                        id="url"
                        value={editedCompetitor.url}
                        onChange={(e) => setEditedCompetitor({ ...editedCompetitor, url: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="revenue" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Estimated Revenue
                      </Label>
                      <Input
                        id="revenue"
                        value={editedCompetitor.estimatedRevenue}
                        onChange={(e) => setEditedCompetitor({ ...editedCompetitor, estimatedRevenue: e.target.value })}
                        placeholder="e.g., $1M-$5M"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="tags" className="flex items-center gap-2">
                        <TagIcon className="h-4 w-4" />
                        Tags
                      </Label>
                      <Input
                        id="tags"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="e.g., RPG, Indie, Pixel Art"
                      />
                      <p className="text-xs text-muted-foreground">Separate tags with commas</p>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {competitor.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
