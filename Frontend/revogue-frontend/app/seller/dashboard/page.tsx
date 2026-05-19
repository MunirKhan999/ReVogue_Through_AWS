"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, DollarSign, TrendingUp, Edit, Trash2 } from "lucide-react"
import { AddProductModal } from "@/components/add-product-modal"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/api-url"

interface Product {
  id: string
  name: string
  price: number
  category: string
  in_stock: boolean
  stock_quantity: number
}

export default function SellerDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") return
    
    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        router.push("/login")
        return
      }
      
      const user = JSON.parse(userStr)
      if (!user || user.role !== "seller") {
        toast({ 
          title: "Access Denied", 
          description: "You need a seller account to access this page.",
          variant: "destructive" 
        })
        router.push("/")
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      router.push("/login")
    }
  }, [router, toast])

  const fetchProducts = useCallback(async () => {
    if (typeof window === "undefined") return

    const token = localStorage.getItem("token")
    if (!token) {
      setError("Authentication required")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${getApiUrl()}/products/seller/my-products`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast({ title: "Session expired. Please login again.", variant: "destructive" })
          router.push("/login")
          return
        }
        if (response.status === 403) {
          const user = JSON.parse(localStorage.getItem("user") || "null")
          let errorMessage = "Access denied. You need a seller account to view this page."
          
          // If localStorage says they're a seller but backend says no, clear stale data
          if (user?.role === "seller") {
            errorMessage = "Access denied. Your account permissions may have changed. Please login again."
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            toast({ 
              title: "Access Denied", 
              description: errorMessage,
              variant: "destructive" 
            })
            setTimeout(() => router.push("/"), 1500)
          } else {
            // Non-seller user trying to access seller page
            toast({ 
              title: "Access Denied", 
              description: errorMessage,
              variant: "destructive" 
            })
            setTimeout(() => router.push("/"), 1500)
          }
          
          setError(errorMessage)
          return
        }
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(errorData.message || `Failed to fetch products: ${response.statusText}`)
      }

      const data = await response.json()
      setProducts(data)
      setError(null)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setError("Failed to load products. Please try again.")
      toast({ title: "Failed to load products", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [router, toast])

  useEffect(() => {
    checkAuth()
    fetchProducts()
  }, [checkAuth, fetchProducts])

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`${getApiUrl()}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        toast({ title: "Product deleted successfully" })
        fetchProducts()
      } else {
        toast({ title: "Failed to delete product", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error deleting product", variant: "destructive" })
    }
  }

  const totalProducts = products.length
  const inStockProducts = products.filter((p) => p.in_stock).length
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock_quantity, 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">Manage your products and track performance</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">{inStockProducts} in stock</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PKR {(totalValue / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total stock value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">Store status</p>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <CardDescription>View and manage your product listings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading products...</p>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={fetchProducts} variant="outline">
                  Retry
                </Button>
              </div>
            ) : products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Product</th>
                      <th className="text-left py-3 px-4 font-medium">Category</th>
                      <th className="text-left py-3 px-4 font-medium">Price</th>
                      <th className="text-left py-3 px-4 font-medium">Stock</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-border">
                        <td className="py-3 px-4 font-medium">{product.name}</td>
                        <td className="py-3 px-4">{product.category}</td>
                        <td className="py-3 px-4">PKR {(product.price / 100).toFixed(2)}</td>
                        <td className="py-3 px-4">{product.stock_quantity}</td>
                        <td className="py-3 px-4">
                          <Badge variant={product.in_stock ? "default" : "secondary"}>
                            {product.in_stock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => toast({ title: "Edit functionality coming soon" })}
                              title="Edit product"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteProduct(product.id)}
                              title="Delete product"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No products yet</p>
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddProductModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          fetchProducts()
        }}
      />
    </div>
  )
}
