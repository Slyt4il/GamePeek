"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Project {
  id: string
  name: string
  description: string
}

interface Competitor {
  id: string
  name: string
  reviewCount?: number
  retailPrice?: number | string
  estimatedRevenue?: string
  rating?: string
  projectId: string
}

type AxisOption = "reviewCount" | "retailPrice" | "estimatedRevenue" | "rating"

const axisOptions = [
  { value: "reviewCount", label: "Review Count" },
  { value: "retailPrice", label: "Retail Price" },
  { value: "estimatedRevenue", label: "Expected Revenue" },
  { value: "rating", label: "Rating" },
]

// Helper function to convert rating to numeric value
const ratingToNumber = (rating: string | undefined): number => {
  if (!rating || rating === "None") return 0

  const ratingMap: Record<string, number> = {
    "Overwhelmingly Positive": 10,
    "Very Positive": 9,
    Positive: 8,
    "Mostly Positive": 7,
    Mixed: 5,
    "Mostly Negative": 3,
    Negative: 2,
    "Very Negative": 1,
    "Overwhelmingly Negative": 0,
  }

  return ratingMap[rating] || 0
}

// Helper function to convert estimated revenue to numeric value
const revenueToNumber = (revenue: string | undefined): number => {
  if (!revenue) return 0

  // Extract numbers from the string
  const match = revenue.match(/\d+/g)
  if (!match) return 0

  // If there are multiple numbers, take the average
  if (match.length > 1) {
    const sum = match.reduce((acc, val) => acc + Number.parseInt(val), 0)
    return sum / match.length
  }

  return Number.parseInt(match[0])
}

// Helper function to calculate median
const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0

  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }

  return sorted[middle]
}

export default function GraphPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [xAxis, setXAxis] = useState<AxisOption>("reviewCount")
  const [yAxis, setYAxis] = useState<AxisOption>("retailPrice")

  // Load project and competitors from localStorage
  useEffect(() => {
    const storedProjects = localStorage.getItem("gamecomp-projects")
    const storedCompetitors = localStorage.getItem("gamecomp-competitors")

    if (storedProjects) {
      const projects = JSON.parse(storedProjects)
      const currentProject = projects.find((p: Project) => p.id === projectId)

      if (currentProject) {
        setProject(currentProject)
      } else {
        router.push("/projects")
      }
    }

    if (storedCompetitors) {
      const allCompetitors = JSON.parse(storedCompetitors)
      const projectCompetitors = allCompetitors.filter((c: Competitor) => c.projectId === projectId)
      setCompetitors(projectCompetitors)
    }
  }, [projectId, router])

  // Prepare data for the chart
  const chartData = useMemo(() => {
    return competitors.map((competitor) => {
      let xValue = 0
      let yValue = 0

      // Get X-axis value
      switch (xAxis) {
        case "reviewCount":
          xValue = competitor.reviewCount || 0
          break
        case "retailPrice":
          xValue = Number.parseFloat(competitor.retailPrice as string) || 0
          break
        case "estimatedRevenue":
          xValue = revenueToNumber(competitor.estimatedRevenue)
          break
        case "rating":
          xValue = ratingToNumber(competitor.rating)
          break
      }

      // Get Y-axis value
      switch (yAxis) {
        case "reviewCount":
          yValue = competitor.reviewCount || 0
          break
        case "retailPrice":
          yValue = Number.parseFloat(competitor.retailPrice as string) || 0
          break
        case "estimatedRevenue":
          yValue = revenueToNumber(competitor.estimatedRevenue)
          break
        case "rating":
          yValue = ratingToNumber(competitor.rating)
          break
      }

      return {
        name: competitor.name,
        x: xValue,
        y: yValue,
      }
    })
  }, [competitors, xAxis, yAxis])

  // Calculate statistics
  const stats = useMemo(() => {
    const retailPrices = competitors
      .map((c) => Number.parseFloat(c.retailPrice as string) || 0)
      .filter((price) => price > 0)

    const revenues = competitors.map((c) => revenueToNumber(c.estimatedRevenue)).filter((revenue) => revenue > 0)

    return {
      retailPrice: {
        max: Math.max(...retailPrices, 0),
        min: retailPrices.filter(p => p > 0).length ? Math.min(...retailPrices.filter(p => p > 0)) : 0,
        avg: retailPrices.length ? retailPrices.reduce((sum, price) => sum + price, 0) / retailPrices.length : 0,
        median: calculateMedian(retailPrices),
      },
      revenue: {
        max: Math.max(...revenues, 0),
        min: revenues.filter(r => r > 0).length ? Math.min(...revenues.filter(r => r > 0)) : 0,
        avg: revenues.length ? revenues.reduce((sum, rev) => sum + rev, 0) / revenues.length : 0,
        median: calculateMedian(revenues),
      },
    }
  }, [competitors])

  // Format axis label
  const formatAxisLabel = (axis: AxisOption): string => {
    switch (axis) {
      case "reviewCount":
        return "Review Count"
      case "retailPrice":
        return "Retail Price ($)"
      case "estimatedRevenue":
        return "Expected Revenue"
      case "rating":
        return "Rating Score (0-10)"
    }
  }

  // Format tooltip value
  const formatTooltipValue = (value: number, axis: AxisOption): string => {
    switch (axis) {
      case "reviewCount":
        return value.toLocaleString()
      case "retailPrice":
        return `$${value.toFixed(2)}`
      case "estimatedRevenue":
        return value.toLocaleString()
      case "rating":
        return value.toFixed(1)
    }
  }

  if (!project) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 page-transition">
      <div className="mb-8">
        <Link
          href={`/projects/${projectId}`}
          className="flex items-center text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Link>
        <h1 className="text-3xl font-bold">{project.name} - Data Analysis </h1>
        <p className="text-muted-foreground mt-1">Visualize competitor data</p>
      </div>

      {competitors.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h2 className="text-xl font-medium mb-4">No competitors to show</h2>
          <p className="text-muted-foreground mb-6 px-4">
            Add competitors to your project to see data visualizations and statistics.
          </p>
          <Link href={`/projects/${projectId}`}>
            <button className="text-primary hover:underline">Go back and add competitors</button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-gradient-to-br from-background to-muted/30">
            <CardHeader>
              <CardTitle>Competitors</CardTitle>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="x-axis">X Axis</Label>
                  <Select value={xAxis} onValueChange={(value) => setXAxis(value as AxisOption)}>
                    <SelectTrigger id="x-axis" className="w-[180px]">
                      <SelectValue placeholder="Select X axis" />
                    </SelectTrigger>
                    <SelectContent>
                      {axisOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="y-axis">Y Axis</Label>
                  <Select value={yAxis} onValueChange={(value) => setYAxis(value as AxisOption)}>
                    <SelectTrigger id="y-axis" className="w-[180px]">
                      <SelectValue placeholder="Select Y axis" />
                    </SelectTrigger>
                    <SelectContent>
                      {axisOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name={formatAxisLabel(xAxis)}
                      label={{ value: formatAxisLabel(xAxis), position: "insideBottom", offset: -10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name={formatAxisLabel(yAxis)}
                      label={{ value: formatAxisLabel(yAxis), angle: -90, position: "insideLeft", offset: -10 }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      formatter={(value, name, props) => {
                        if (name === "x") {
                          return [formatTooltipValue(value as number, xAxis), formatAxisLabel(xAxis)]
                        }
                        return [formatTooltipValue(value as number, yAxis), formatAxisLabel(yAxis)]
                      }}
                      labelFormatter={(label) => chartData[label as number]?.name || ""}
                    />
                    <Legend wrapperStyle={{ marginTop: 15 }} />
                    {competitors.map((competitor, index) => {
                      const dataPoint = chartData.find((d) => d.name === competitor.name)
                      if (!dataPoint) return null

                      // Generate a color based on index
                      const colors = [
                        "#FF6B6B",
                        "#4ECDC4",
                        "#FFD166",
                        "#06D6A0",
                        "#118AB2",
                        "#073B4C",
                        "#8338EC",
                        "#3A86FF",
                        "#FB5607",
                        "#FFBE0B",
                      ]
                      const color = colors[index % colors.length]

                      return <Scatter key={competitor.id} name={competitor.name} data={[dataPoint]} fill={color} />
                    })}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-background to-primary/5">
              <CardHeader>
                <CardTitle>Retail Price Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4 bg-background/50">
                    <div className="text-sm text-muted-foreground">Maximum</div>
                    <div className="text-2xl font-bold text-primary">${stats.retailPrice.max.toFixed(2)}</div>
                  </div>
                  <div className="border rounded-md p-4 bg-background/50">
                    <div className="text-sm text-muted-foreground">Minimum</div>
                    <div className="text-2xl font-bold text-primary">${stats.retailPrice.min.toFixed(2)}</div>
                  </div>
                  <div className="border rounded-md p-4 bg-background/50">
                    <div className="text-sm text-muted-foreground">Average</div>
                    <div className="text-2xl font-bold text-primary">${stats.retailPrice.avg.toFixed(2)}</div>
                  </div>
                  <div className="border rounded-md p-4 bg-background/50">
                    <div className="text-sm text-muted-foreground">Median</div>
                    <div className="text-2xl font-bold text-primary">${stats.retailPrice.median.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background to-revenue/5">
              <CardHeader>
                <CardTitle>Expected Revenue Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4 bg-background/50">
                    <div className="text-sm text-muted-foreground">Maximum</div>
                    <div className="text-2xl font-bold text-revenue">{stats.revenue.max.toLocaleString()}</div>
                  </div>
                  <div className="border rounded-md p-4 bg-background/50">
                    <div className="text-sm text-muted-foreground">Minimum</div>
                    <div className="text-2xl font-bold text-revenue">{stats.revenue.min.toLocaleString()}</div>
                  </div>
                  <div className="border rounded-md p-4 bg-background/50">
                    <div className="text-sm text-muted-foreground">Average</div>
                    <div className="text-2xl font-bold text-revenue">{stats.revenue.avg.toLocaleString()}</div>
                  </div>
                  <div className="border rounded-md p-4 bg-background/50">
                    <div className="text-sm text-muted-foreground">Median</div>
                    <div className="text-2xl font-bold text-revenue">{stats.revenue.median.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
