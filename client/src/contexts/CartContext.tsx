import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ColorVariant {
  id: string;
  label: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  badge?: string;
  description: string;
  longDescription: string;
  fileFormat: string;
  pages: number;
  rating: number;
  downloads: number;
  tags: string[];
  colorVariants?: ColorVariant[];
}

export interface CartItem {
  product: Product;
  /** Number of print copies in the selected pack (1, 5, 10, or 25) */
  packQty: number;
  /** Total price for this line item (already accounts for pack discount) */
  linePrice: number;
  /** Selected color theme variant (e.g. 'Neutral', 'Bold', 'Dark') */
  colorTheme?: string;
  /** Selected style variant (e.g. 'Minimalist', 'Classic') */
  styleVariant?: string;
  /** Selected paper size (e.g. 'US Letter', 'A4', 'A5') */
  paperSize?: string;
}

const CART_STORAGE_KEY = "printstatic_cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}

interface CartContextType {
  items: CartItem[];
  /**
   * Add a product to the cart.
   * @param product      The product to add
   * @param packQty      Number of copies in the pack (default 1)
   * @param linePrice    Total price for the pack (default product.price)
   * @param colorTheme   Selected color theme variant
   * @param styleVariant Selected style variant
   * @param paperSize    Selected paper size
   */
  addToCart: (product: Product, packQty?: number, linePrice?: number, colorTheme?: string, styleVariant?: string, paperSize?: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  // Persist to localStorage whenever items change
  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addToCart = (product: Product, packQty = 1, linePrice?: number, colorTheme?: string, styleVariant?: string, paperSize?: string) => {
    const resolvedPrice = linePrice ?? product.price * packQty;
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        // Replace with the new pack selection rather than stacking
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, packQty, linePrice: resolvedPrice, colorTheme, styleVariant, paperSize }
            : i
        );
      }
      return [...prev, { product, packQty, linePrice: resolvedPrice, colorTheme, styleVariant, paperSize }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.packQty, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.linePrice, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
