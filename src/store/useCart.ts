import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';

export interface CartItem {
  id: string; // Add a unique cart item ID
  product: Product;
  quantity: number;
  variants?: Record<string, string>;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product, quantity: number, variants?: Record<string, string>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setIsCartOpen: (isOpen: boolean) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      addToCart: (product, quantity, variants) => {
        set((state) => {
          const cartItemId = `${product.id}-${JSON.stringify(variants || {})}`;
          const existingItemIndex = state.items.findIndex(
            (item) => item.id === cartItemId
          );

          if (existingItemIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems, isCartOpen: true };
          }

          return { 
            items: [...state.items, { id: cartItemId, product, quantity, variants }],
            isCartOpen: true 
          };
        });
      },

      removeFromCart: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      setIsCartOpen: (isOpen) => {
        set({ isCartOpen: isOpen });
      },

      getCartTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'mercaply-cart',
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);
