"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ProductModal } from "@/components/product-modal"

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

export function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast()
  const [showModal, setShowModal] = useState(false)

  const addToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    cart.push({ ...product, quantity: 1 })
    localStorage.setItem("cart", JSON.stringify(cart))

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    })

    window.dispatchEvent(new Event("cartUpdated"))
  }

  const formatPrice = (price: number) => {
    return `PKR ${(price / 100).toFixed(2)}`
  }

  return (
    <>
      <Card
        className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
          {!product.in_stock && <Badge className="absolute top-2 right-2 bg-destructive">Out of Stock</Badge>}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button size="sm" variant="secondary" className="gap-2">
              <Eye className="h-4 w-4" />
              Quick View
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <Badge variant="outline" className="mb-2">
            {product.category}
          </Badge>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{formatPrice(product.price)}</span>
            <Button
              size="sm"
              onClick={addToCart}
              disabled={!product.in_stock}
              className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <ShoppingCart className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProductModal product={product} open={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
