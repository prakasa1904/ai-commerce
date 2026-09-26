import { Button } from '../../presentation/components/ui/button';
import { formatPrice } from './productUtils';

interface MobilePurchaseBarProps {
  total: number;
  onAddToCart: () => void;
}

const MobilePurchaseBar = ({ total, onAddToCart }: MobilePurchaseBarProps) => (
  <aside
    className="lg:hidden fixed inset-x-0 bottom-0 bg-cream/95 border-t border-wheat/60 backdrop-blur z-[45] px-4 py-3"
    aria-label="Purchase actions"
  >
    <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-display font-black text-muted-foreground">Total:</span>
        <span className="text-xl font-display font-black text-forest">{formatPrice(total)}</span>
      </div>
      <Button
        size="lg"
        className="h-12 min-w-[10rem] bg-honey hover:bg-[#d98f1a] text-forest font-display font-black transition-colors rounded-full"
        onClick={onAddToCart}
      >
        Add to Cart
      </Button>
    </div>
  </aside>
);

export default MobilePurchaseBar;