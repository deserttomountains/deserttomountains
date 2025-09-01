"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CartItem = {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  subtitle?: string;
  type?: string;
  variant?: string;
  shades?: Array<{
    shadeId: string;
    shadeName: string;
    shadeHex: string;
    quantity: number;
  }>;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart (if exists, increase quantity)
  const addToCart = (item: CartItem) => {
    console.log('=== ADDING TO CART DEBUG ===');
    console.log('Item being added:', item);
    console.log('Current cart before adding:', cart);
    console.log('Item has shades:', !!item.shades);
    console.log('Shades data:', item.shades);
    console.log('User agent:', navigator.userAgent);
    
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        // Update existing item with new data (including new image) but preserve quantity
        const updatedCart = prev.map(i => i.id === item.id ? { ...item, quantity: i.quantity + item.quantity } : i);
        console.log('Updated existing item, new cart:', updatedCart);
        return updatedCart;
      }
      const newCart = [...prev, item];
      console.log('Added new item, new cart:', newCart);
      return newCart;
    });
  };

  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  // Update quantity
  const updateQuantity = (id: number, quantity: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  // Clear cart
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
} 