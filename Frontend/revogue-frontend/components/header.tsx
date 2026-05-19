"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { signOut } from "aws-amplify/auth"
import { Sparkles, ShoppingCart, LogOut, Package, Search, User } from "lucide-react"

interface UserInterface {
  id: string
  email: string
  full_name: string
  role: string
}

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserInterface | null>(null)
  const [cartCount, setCartCount] = useState(0)

  const updateUserState = useCallback(() => {
    if (typeof window === "undefined") return
    
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
        setUser(null)
      }
    } else {
      setUser(null)
    }

    // Get cart count
    const cart = localStorage.getItem("cart")
    if (cart) {
      try {
        const items = JSON.parse(cart)
        setCartCount(Array.isArray(items) ? items.length : 0)
      } catch (error) {
        console.error("Error parsing cart data:", error)
        setCartCount(0)
      }
    } else {
      setCartCount(0)
    }
  }, [])

  useEffect(() => {
    updateUserState()

    // Listen for storage changes (e.g., when user logs in on another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "token" || e.key === "cart") {
        updateUserState()
      }
    }

    // Listen for focus events (when user returns to this tab)
    const handleFocus = () => {
      updateUserState()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [updateUserState])

  // Update user state when route changes (in case user logged in on another page)
  useEffect(() => {
    updateUserState()
  }, [pathname, updateUserState])

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Cognito sign out failed:", error)
    }
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Sparkles className="h-6 w-6 text-brand" />
          <span className="font-bold text-xl">ReVogue</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = (e.target as HTMLInputElement).value
                  if (value) router.push(`/store?search=${value}`)
                }
              }}
            />
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/store" className="hidden md:inline-flex text-sm font-medium hover:text-brand transition-colors">
            Shop
          </Link>

          {user ? (
            <>
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-brand text-brand-foreground">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">{user.full_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "seller" && (
                    <DropdownMenuItem asChild>
                      <Link href="/seller/dashboard" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        Seller Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
