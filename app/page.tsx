import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] page-transition">
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4 animate-fadeIn">GamePeek | Competitive Analysis Board for Indie Developers</h1>
        <p className="text-xl text-muted-foreground mb-8 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
          Follow and learn from games like yours to enhance your design strategy.
        </p>
        <div className="flex justify-center">
          <Link href="/projects">
            <Button size="lg" className="gap-2 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
              <PlusCircle className="h-5 w-5" />
              Start a New Project
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
