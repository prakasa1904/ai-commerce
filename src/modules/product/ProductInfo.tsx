import type { Product } from '../../domain/types/product';
import { unitOf } from './productUtils';

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = ({ product }: ProductInfoProps) => (
  <div className="min-w-0 flex flex-col gap-5 pr-0 lg:pr-6">
    {/* Field note */}
    <div className="rounded-xl border border-wheat-800/50 bg-kraft p-4 lg:p-5 relative overflow-hidden">
      <span
        aria-hidden="true"
        className="absolute -top-3 -right-2 h-3 w-3 bg-moss/60 rounded-full shadow-sm"
      />
      {/* ruled paper */}
      <div aria-hidden="true" className="absolute inset-0 -z-[1] bg-cream/70">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="left-4 right-4 h-px bg-wheat-800/40"
            style={{ top: `${i * 22 + 16}px` }}
          />
        ))}
      </div>
      <span className="relative z-0 inline-block bg-cream px-2.5 pb-1 font-display font-black text-[0.68rem] uppercase tracking-[0.2em] text-clay">
        Field note
      </span>
      {product.description.split(/\n\s*\n/).map((para, i) => (
        <p key={i} className="relative z-10 mt-4 leading-[1.8] text-base text-soil/85 first:mt-3 first:pb-2.5">
          {para}
        </p>
      ))}
    </div>

    {/* Stall ledger */}
    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 border-l-2 border-wheat-800/50 pl-5 space-y-4">
      <div>
        <dt className="text-[0.64rem] font-display font-black uppercase tracking-[0.24em] text-moss">
          Today&apos;s price
        </dt>
        <dd className="mt-1 font-display font-black text-2xl text-pine leading-none">
          Rp{product.price.toLocaleString('id-ID')}
        </dd>
      </div>
      <div>
        <dt className="text-[0.64rem] font-display font-black uppercase tracking-[0.24em] text-moss">
          Sold by the
        </dt>
        <dd className="mt-1 font-display font-bold text-sm text-clay tracking-wide">
          /{unitOf(product.description)}
        </dd>
      </div>
      <div>
        <dt className="text-[0.64rem] font-display font-black uppercase tracking-[0.24em] text-moss">
          Source
        </dt>
        <dd className="mt-1 font-display font-semibold text-sm text-forest">Local Farm</dd>
      </div>
    </dl>
  </div>
);

export default ProductInfo;