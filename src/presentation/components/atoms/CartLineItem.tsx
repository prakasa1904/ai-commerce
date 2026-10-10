import React from 'react';
import { CircleX, Minus, Plus } from 'lucide-react';
import type { CartItem } from '../../../application/hooks/useCart';
import { formatPrice, unitOf } from '../../../modules/product/productUtils';

const CartLineItem: React.FC<{
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}> = ({ item, onIncrement, onDecrement, onRemove }) => (
  <div className="flex items-center gap-3 py-3">
    <img src={item.product.imageUrl ?? 'https://dummyimage.com/300x300/3E6B4F/FBF8F1&text=Farm%20Fresh'}
      alt={item.product.title} loading="lazy"
      className="h-16 w-16 shrink-0 rounded-lg border border-wheat/40 object-cover bg-cream" />
    <div className="min-w-0 flex-1">
      <p className="line-clamp-1 font-display font-bold text-sm text-forest">{item.product.title}</p>
      <p className="mt-0.5 text-[0.62rem] font-display font-black uppercase tracking-[0.2em] text-honey">
        {formatPrice(item.product.price)} / {unitOf(item.product.description)}
      </p>
      <div className="mt-1.5 flex items-center gap-1">
        <button type="button" aria-label="Decrease quantity" disabled={item.quantity <= 1} onClick={onDecrement}
          className="grid h-8 w-8 place-items-center rounded border border-wheat/40 text-forest/60 transition-colors hover:bg-wheat/50 disabled:pointer-events-none disabled:opacity-40">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[1.5rem] shrink-0 tabular-nums text-center font-display font-black text-base text-forest">{item.quantity}</span>
        <button type="button" aria-label="Increase quantity" onClick={onIncrement}
          className="grid h-8 w-8 place-items-center rounded border border-wheat/40 text-forest/60 transition-colors hover:bg-wheat/50">
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button type="button" aria-label="Remove item" onClick={onRemove}
          className="grid h-7 w-7 shrink-0 place-items-center text-soil/60 transition-colors hover:text-rose">
          <CircleX className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </div>
);

export default CartLineItem;