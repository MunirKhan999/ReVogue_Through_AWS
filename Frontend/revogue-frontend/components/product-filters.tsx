"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const CATEGORIES = ["Tops", "Bottoms", "Outerwear", "Dresses", "Footwear", "Accessories"]

export function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") || "all"

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // If clicking "all", always clear the filter
    if (category === "all") {
      params.delete("category")
    } 
    // If clicking the same category that's already selected, unselect it (go to "all")
    else if (category === currentCategory && currentCategory !== "all") {
      params.delete("category")
    } 
    // Otherwise, set the new category
    else {
      params.set("category", category)
    }
    
    router.push(`/store?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/store")
  }

  const hasActiveFilters = currentCategory !== "all"

  return (
    <div className="space-y-6 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      <div>
        <Label className="mb-3 block">Category</Label>
        <RadioGroup value={currentCategory} onValueChange={handleCategoryChange}>
          <div className="space-y-3">
            <RadioGroupItem value="all">
              All Products
            </RadioGroupItem>
            {CATEGORIES.map((category) => (
              <RadioGroupItem key={category} value={category}>
                {category}
              </RadioGroupItem>
            ))}
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
