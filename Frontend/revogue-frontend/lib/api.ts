import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  product_id: number
  name: string
  price: number
  quantity: number
  image_url?: string
  size?: string
  color?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.product_id === item.product_id)

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id ? { ...i, quantity: i.quantity + item.quantity } : i,
              ),
            }
          }

          return { items: [...state.items, item] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product_id !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) => (item.product_id === productId ? { ...item, quantity } : item)),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: "revogue-cart",
    },
  ),
)
