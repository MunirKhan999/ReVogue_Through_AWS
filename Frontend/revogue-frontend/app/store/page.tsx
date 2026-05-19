"use client"

import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { StoreContent } from "./store-content"

export default function StorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background p-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      }
    >
      <StoreContent />
    </Suspense>
  )
}
