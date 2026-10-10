import { useContext } from 'react';
import { CartContext, type CartItem } from '../providers/CartProvider';

export type { CartItem };

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}