import React, { createContext, useContext, useState } from 'react';
import { ALL_PRODUCTS } from '../data/homeData';

const CartContext = createContext();

export function CartProvider({ children }) {
  // cart: { [productId]: { qty, variantIndex } }
  const [cart, setCart] = useState({});

  const updateCart = (id, delta, variantIndex = 0) =>
    setCart(prev => {
      const current = prev[id] || { qty: 0, variantIndex };
      const qty = Math.max(0, current.qty + delta);
      if (qty === 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { qty, variantIndex: current.variantIndex } };
    });

  const setVariant = (id, variantIndex) =>
    setCart(prev => prev[id] ? { ...prev, [id]: { ...prev[id], variantIndex } } : prev);

  const removeItem = (id) =>
    setCart(prev => { const next = { ...prev }; delete next[id]; return next; });

  const clearCart = () => setCart({});

  const cartItems = ALL_PRODUCTS
    .filter(p => cart[p.id]?.qty > 0)
    .map(p => ({
      ...p,
      qty: cart[p.id].qty,
      variantIndex: cart[p.id].variantIndex,
      selectedVariant: p.variants[cart[p.id].variantIndex] ?? p.variants[0],
    }));

  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalAmt = cartItems.reduce((s, i) => s + i.qty * i.selectedVariant.price, 0);
  const saving = Math.round(totalAmt * 0.1);

  return (
    <CartContext.Provider value={{ cart, cartItems, totalItems, totalAmt, saving, updateCart, setVariant, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
