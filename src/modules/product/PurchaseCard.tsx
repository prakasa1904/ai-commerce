import type { Product } from '../../domain/types/product';
import { formatPrice, unitOf } from './productUtils';
import QuantityStepper from './QuantityStepper';

interface PurchaseCardProps {
  product: Product;
  quantity: number;
  total: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onAddToCart: () => void;
}

const PurchaseCard = ({ product, quantity, total, onDecrement, onIncrement, onAddToCart }: PurchaseCardProps) => (
  // A kraft crate tag "tie-on" — like a label tied with twine on a bundle.
  <div className="lg:sticky lg:top-20 w-full lg:w-[20rem]">
    <div
      aria-hidden="true"
      className="absolute -inset-3 -z-0 rounded-2xl bg-[radial-gradient(600px_260px_at_30%_0%,rgba(31,59,44,0.05),transparent_60%)] blur-sm"
    />
    <div className="relative overflow-hidden rounded-2xl bg-kraft border border-[#C9B280]/70 p-5 lg:p-6 shadow-2xl">
      {/* Twine loop & knot */}
      <div className="flex">
        <span className="shrink-0">
          <span aria-hidden="true" className="block h-8 w-1 rounded-full bg-forest/40" />
        </span>
        <span
          aria-hidden="true"
          className="mt-1 h-3.5 w-3.5 rotate-45 rounded-sm bg-forest/50"
        />
        <span className="grow" />
      </div>

      <div className="mt-4">
        <p className="font-display text-[0.62rem] font-black uppercase tracking-[0.3em] text-moss">
          Weight &amp; price
        </p>
        <p className="mt-1 font-display font-black text-5xl text-ink tabular-nums leading-none">
          {formatPrice(product.price)}
          <span className="ml-1 font-display text-xs font-bold uppercase tracking-[0.18em] text-soil">
            /{' '}
            {unitOf(product.description)}
          </span>
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-soil/60">
          Cut this morning &middot; same-day to your door
        </p>
        {product.wholesale && (
          <p className="mt-1.5 text-[0.62rem] font-display font-black uppercase tracking-[0.22em] text-clay">
            Wholesale lot
          </p>
        )}
      </div>

      <div className="mt-5 flex w-full flex-col gap-3">
        <QuantityStepper
          quantity={quantity}
          label="Qty"
          onDecrement={onDecrement}
          onIncrement={onIncrement}
        />
        <div className="flex w-full items-center justify-between">
          <p className="font-display text-[0.62rem] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Total
          </p>
          <p className="shrink-0 font-display font-black text-2xl text-ink tabular-nums">
            {formatPrice(total)}
          </p>
        </div>
      </div>

      {/* Twine-tied crate tag, full width:
          left = wax seal, right = action. Tie-on like the farmer makes to
          keep a bundle labelled. Small and deliberate. */}
      <div className="relative mt-5 w-full">
        <div className="grid w-full grid-cols-[3rem_1fr] grid-rows-1 gap-x-4 rounded-2xl border border-[#C9B280]/80 bg-kraft p-2.5 shadow-xl transition-transform hover:-translate-y-0.5 hover:shadow-2xl">
          {/* twine & knot across the whole tag */}
          <span aria-hidden="true" className="absolute left-1/2 h-3.5 w-5 -translate-x-1/2 bg-forest/40 rounded-sm" style={{ top: '-0.5rem' }} />
          <span aria-hidden="true" className="absolute right-5 h-4 w-1 rounded-full bg-forest/40" style={{ top: '-0.75rem' }} />
          <span aria-hidden="true" className="absolute left-[25px] h-4 w-1 rounded-full bg-forest/40" style={{ top: '-0.75rem' }} />
          {/* left: wax seal */}
          <span
            aria-hidden="true"
            className="z-0 h-12 w-12 rotate-6 bg-honey shadow-md"
          />
          <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-honey rotate-6">
            <span aria-hidden="true" className="h-6 w-6 text-forest">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="9" r="2" />
                <path d="M10 4h4l2.5 3L16 8" />
                <path d="m9 12 3 3-3 3" />
              </svg>
            </span>
          </span>
          {/* right: action label */}
          <span className="col-span-1 self-center font-display font-black uppercase tracking-[0.22em] text-forest text-sm whitespace-nowrap">
            Add to crate
          </span>
        </div>
        <button type="button" onClick={onAddToCart} aria-label="Add to crate" className="absolute inset-0 z-10 h-full w-full" />
      </div>

      <p className="mt-3.5 text-[11px] leading-5 text-soil/60 text-center">
        Free delivery &middot; picked to order &middot; farm-fresh guarantee
      </p>
    </div>
  </div>
);

export default PurchaseCard;