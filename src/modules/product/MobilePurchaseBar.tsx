import { ShoppingBasket } from 'lucide-react';
import { formatPrice } from './productUtils';
import QuantityStepper from './QuantityStepper';
import { useCart } from '../../application/hooks/useCart';

interface MobilePurchaseBarProps {
  quantity: number;
  total: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onAddToCart: () => void;
}

const MobilePurchaseBar = ({
  quantity,
  total,
  onDecrement,
  onIncrement,
  onAddToCart,
}: MobilePurchaseBarProps) => {
  const { count } = useCart();

  return (
    <aside
      className="lg:hidden fixed inset-x-0 bottom-0 bg-kraft/95 border-t border-[#C9B280]/70 backdrop-blur z-[45] px-4 py-3"
      aria-label="Purchase actions"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kraft text-forest">
            <ShoppingBasket className="h-4.5 w-4.5" aria-hidden="true" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1.5 rounded-full bg-honey px-1.5 py-0.5 text-[0.62rem] font-black text-forest">
                {count}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={onAddToCart}
            className="h-10 min-w-[8rem] px-5 bg-clay hover:bg-[#9d5130] text-wheat font-display font-black text-xs uppercase tracking-[0.2em] transition-colors rounded-full"
          >
            Add to crate
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-4">
          <QuantityStepper quantity={quantity} onDecrement={onDecrement} onIncrement={onIncrement} />
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-display font-black text-soil/80">Total</span>
            <span className="text-xl font-display font-black text-ink tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default MobilePurchaseBar;