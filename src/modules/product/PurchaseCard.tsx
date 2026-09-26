import { ShieldCheck } from 'lucide-react';
import type { Product } from '../../domain/types/product';
import { Button } from '../../presentation/components/ui/button';
import QuantityStepper from './QuantityStepper';
import { formatPrice, unitOf } from './productUtils';

interface PurchaseCardProps {
  product: Product;
  quantity: number;
  total: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
}

const PurchaseCard = ({ product, quantity, total, onQuantityChange, onAddToCart }: PurchaseCardProps) => (
  <div className="rounded-2xl bg-card border border-wheat/60 p-6 md:p-8 shadow-sm lg:sticky top-24">
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-display font-black uppercase tracking-[0.18em] text-muted-foreground">
              Price
            </p>
            <p className="mt-1 text-4xl font-display font-black text-forest">
              {formatPrice(product.price)}
              <span className="ml-2 text-sm font-display font-bold text-muted-foreground">
                /{unitOf(product.description)}
              </span>
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">Harvest to doorstep, same day.</p>
            <div className="mt-2 inline-flex gap-1.5 text-[0.7rem] text-soil/70">
              <span className="inline-flex items-center gap-1 bg-moss/15 text-forest px-2 py-0.5 rounded-full">
                In season
              </span>
              {product.wholesale && (
                <span className="inline-flex items-center gap-1 bg-honey/25 text-forest px-2 py-0.5 rounded-full">
                  Wholesale
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <label htmlFor="qty" className="sr-only">
              Quantity
            </label>
            <QuantityStepper
              quantity={quantity}
              onDecrement={() => onQuantityChange(Math.max(1, quantity - 1))}
              onIncrement={() => onQuantityChange(quantity + 1)}
            />
          </div>
        </div>

        <Button
          size="lg"
          className="w-full h-12 bg-honey hover:bg-[#d98f1a] text-forest font-display font-black text-base tracking-wide rounded-full shadow-md transition-shadow duration-300 hover:shadow-lg duration-200 active:translate-y-0.5"
          onClick={onAddToCart}
        >
          Add to Cart &mdash; {formatPrice(total)}
        </Button>
      </div>

      <div className="mt-4 rounded-xl bg-wheat/50 border border-wheat/50 px-4 py-3 text-xs text-muted-foreground flex items-center justify-center gap-2">
        <ShieldCheck className="h-4 w-4 text-forest" />
        Secure checkout &middot; 100% farm-fresh guarantee
      </div>
    </div>
  </div>
);

export default PurchaseCard;