"use client"

import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Filter } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  in_stock: boolean
  sizes?: string[]
  colors?: string[]
}

export default function StorePage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [searchParams])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchParams.get("category")) params.append("category", searchParams.get("category")!)
      if (searchParams.get("search")) params.append("search", searchParams.get("search")!)

      const response = await fetch(`http://localhost:3001/products?${params}`)
      
      if (!response.ok) {
        console.error("Failed to fetch products:", response.statusText)
        setProducts([])
        return
      }

      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Shop All Products</h1>
            <p className="text-muted-foreground">{loading ? "Loading..." : `${products.length} products found`}</p>
          </div>

          <Button variant="outline" className="md:hidden bg-transparent" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex gap-8">
          <aside className={`${showFilters ? "block" : "hidden"} md:block w-64 shrink-0`}>
            <ProductFilters />
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No products found</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
