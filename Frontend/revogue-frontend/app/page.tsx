"use client"

import { Button } from "@/components/ui/button"
import { ShoppingBag, Sparkles, ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        try {
          setUser(JSON.parse(userStr))
        } catch (error) {
          console.error("Error parsing user:", error)
        }
      }
    }
  }, [])

  const handleStartSelling = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!user) {
      // Not logged in - redirect to signup
      router.push("/signup")
      toast({
        title: "Create a Seller Account",
        description: "Sign up to start selling on ReVogue",
      })
    } else if (user.role === "seller") {
      // Already a seller - go to dashboard
      router.push("/seller/dashboard")
    } else {
      // Logged in as buyer - show message
      toast({
        title: "Upgrade to Seller",
        description: "You need a seller account to access the seller dashboard. Please create a new account with seller role.",
        variant: "default",
      })
      // Optionally redirect to signup
      setTimeout(() => {
        router.push("/signup")
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Revolutionizing Fashion E-Commerce</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance">
              Discover Fashion That Speaks to You
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Your premier destination for curated fashion. Buy from trusted sellers or start your own fashion journey.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/store">
                <Button 
                  size="lg" 
                  className="bg-brand text-brand-foreground hover:bg-brand/90 gap-2 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Browse Collection
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 px-8 py-6 text-lg font-semibold border-2 hover:bg-accent/50 hover:border-brand/50 transition-all duration-200 hover:scale-105"
                onClick={handleStartSelling}
              >
                <TrendingUp className="h-5 w-5" />
                Start Selling
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose ReVogue?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience seamless fashion shopping with our modern platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-brand" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Curated Selection</h3>
              <p className="text-muted-foreground">
                Discover unique pieces from verified sellers with quality you can trust
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-brand" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Secure Shopping</h3>
              <p className="text-muted-foreground">
                Shop with confidence using our secure payment and order tracking system
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center mb-4">
                {/* TrendingUp icon removed for brevity */}
              </div>
              <h3 className="font-semibold text-xl mb-2">Seller Tools</h3>
              <p className="text-muted-foreground">
                Powerful dashboard for sellers to manage products and track orders
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-brand/10 to-accent/10 rounded-2xl p-12 border border-brand/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Wardrobe?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join thousands of fashion enthusiasts shopping and selling on ReVogue
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/store">
                <Button size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90">
                  Start Shopping
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-brand" />
                <span className="font-bold">ReVogue</span>
              </div>
              <p className="text-sm text-muted-foreground">Your premier fashion e-commerce destination</p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/store?category=Tops" className="hover:text-foreground transition-colors">
                    Tops
                  </Link>
                </li>
                <li>
                  <Link href="/store?category=Bottoms" className="hover:text-foreground transition-colors">
                    Bottoms
                  </Link>
                </li>
                <li>
                  <Link href="/store?category=Dresses" className="hover:text-foreground transition-colors">
                    Dresses
                  </Link>
                </li>
                <li>
                  <Link href="/store?category=Accessories" className="hover:text-foreground transition-colors">
                    Accessories
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/seller/dashboard" className="hover:text-foreground transition-colors">
                    Become a Seller
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} ReVogue. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
