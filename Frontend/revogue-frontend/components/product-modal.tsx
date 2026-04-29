"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export function ProductModal({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const { toast } = useToast()

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    cart.push({ ...product, quantity: 1 })
    localStorage.setItem("cart", JSON.stringify(cart))

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    })

    window.dispatchEvent(new Event("cartUpdated"))
    onClose()
  }

  const formatPrice = (price: number) => {
    return `PKR ${(price / 100).toFixed(2)}`
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
            {product.image_url ? (
              <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <p className="text-3xl font-bold text-brand">{formatPrice(product.price)}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Available Sizes</h3>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <Badge key={size} variant="secondary">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Available Colors</h3>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <Badge key={color} variant="secondary">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${product.in_stock ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm">{product.in_stock ? "In Stock" : "Out of Stock"}</span>
            </div>

            <Button
              className="w-full gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={addToCart}
              disabled={!product.in_stock}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
