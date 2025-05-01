"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { FolderKanban } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <FolderKanban className="h-6 w-6" />
          <span className="font-bold text-xl">GameComp</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className={pathname === "/" ? "font-medium" : "text-muted-foreground"}>
            Home
          </Link>
          <Link href="/projects" className={pathname.startsWith("/projects") ? "font-medium" : "text-muted-foreground"}>
            Projects
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
