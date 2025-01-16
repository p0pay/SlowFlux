'use client'

import Link from "next/link"
import { Button } from "./ui/button"
import { History, LogOut } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useToast } from "./ui/use-toast"
import { ThemeToggle } from "./theme-toggle"

export function Nav() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Logout failed')
      }

      router.push('/login')
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="font-bold">
          SlowFlux
        </Link>
        <div className="flex items-center space-x-2">
          <Link href="/history">
            <Button variant="ghost" size="icon">
              <History className="h-5 w-5" />
            </Button>
          </Link>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}

