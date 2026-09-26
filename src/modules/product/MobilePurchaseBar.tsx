import { formatPrice } from './productUtils';

interface MobilePurchaseBarProps {
  total: number;
  onAddToCart: () => void;
}

const MobilePurchaseBar = ({ total, onAddToCart }: MobilePurchaseBarProps) => (
  <aside
    className="lg:hidden fixed inset-x-0 bottom-0 bg-kraft/95 border-t border-[#C9B280]/70 backdrop-blur z-[45] px-4 py-3"
    aria-label="Purchase actions"
  >
    <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-display font-black text-soil/80">Total</span>
        <span className="text-xl font-display font-black text-ink">{formatPrice(total)}</span>
      </div>
      <button
        type="button"
        onClick={onAddToCart}
        className="h-10 min-w-[8rem] px-5 bg-clay hover:bg-[#9d5130] text-wheat font-display font-black text-xs uppercase tracking-[0.2em] transition-colors rounded-full"
      >
        Add to crate
      </button>
    </div>
  </aside>
);

export default MobilePurchaseBar;