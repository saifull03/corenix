'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: number | string;
  name: string;
  slug?: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image?: string;
  warranty?: string;
  specs?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Partial<CartItem> & { id: number | string; name: string; price: number }, qty?: number) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, delta: number) => void;
  setQuantity: (id: number | string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  setQuantity: () => {},
  clearCart: () => {},
  cartCount: 0,
  subtotal: 0,
  isLoaded: false,
});

const defaultInitialCart: CartItem[] = [
  {
    id: 1,
    name: 'MSI GeForce RTX 5060 Gaming X 8GB GDDR6 Graphics Card',
    slug: 'msi-geforce-rtx-5060-gaming-x-8gb',
    sku: 'GPU-MSI-5060-GX',
    price: 43500,
    originalPrice: 46000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
    warranty: '3 Years Official Warranty',
  },
  {
    id: 17,
    name: 'AMD Ryzen 7 9800X3D 8-Core 16-Thread Gaming Processor',
    slug: 'amd-ryzen-7-9800x3d-processor',
    sku: 'CPU-AMD-9800X3D',
    price: 59900,
    originalPrice: 64500,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80',
    warranty: '3 Years Official Warranty',
  },
];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('corenix_shopping_cart');
      if (saved) {
        setCartItems(JSON.parse(saved));
      } else {
        setCartItems(defaultInitialCart);
        localStorage.setItem('corenix_shopping_cart', JSON.stringify(defaultInitialCart));
      }
    } catch (e) {
      setCartItems(defaultInitialCart);
    }
    setIsLoaded(true);
  }, []);

  // Save changes to localStorage
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    try {
      localStorage.setItem('corenix_shopping_cart', JSON.stringify(items));
    } catch (e) {}
  };

  const addToCart = (item: Partial<CartItem> & { id: number | string; name: string; price: number }, qty = 1) => {
    const existingIndex = cartItems.findIndex((i) => String(i.id) === String(item.id));
    let updated: CartItem[];

    if (existingIndex > -1) {
      updated = cartItems.map((i, index) =>
        index === existingIndex ? { ...i, quantity: i.quantity + qty } : i
      );
    } else {
      const newItem: CartItem = {
        id: item.id,
        name: item.name,
        slug: item.slug || '',
        sku: item.sku || 'N/A',
        price: Number(item.price),
        originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
        quantity: Math.max(1, qty),
        image: item.image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
        warranty: item.warranty || '1 Year Official Warranty',
        specs: item.specs,
      };
      updated = [...cartItems, newItem];
    }

    saveCart(updated);
  };

  const removeFromCart = (id: number | string) => {
    const updated = cartItems.filter((i) => String(i.id) !== String(id));
    saveCart(updated);
  };

  const updateQuantity = (id: number | string, delta: number) => {
    const updated = cartItems
      .map((i) => {
        if (String(i.id) === String(id)) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      })
      .filter(Boolean) as CartItem[];

    saveCart(updated);
  };

  const setQuantity = (id: number | string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    const updated = cartItems.map((i) =>
      String(i.id) === String(id) ? { ...i, quantity: qty } : i
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        setQuantity,
        clearCart,
        cartCount,
        subtotal,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
