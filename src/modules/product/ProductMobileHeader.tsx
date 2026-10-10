import { Leaf } from 'lucide-react';
import type { Product } from '../../domain/types/product';
import { categoryLabels } from './productUtils';

interface ProductMobileHeaderProps {
  product: Product;
}

const ProductMobileHeader = ({ product }: ProductMobileHeaderProps) => {
  const imageUrl = product.imageUrl ?? '/img/product-placeholder.svg';

  return (
    <header className="lg:hidden grid grid-cols-[1fr_4rem] items-center gap-4">
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-card border border-wheat/60">
        <img
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <p className="font-display text-xs font-black uppercase tracking-[0.2em] text-honey">
          {categoryLabels[product.category]}
        </p>
        <h1 className="text-xl font-black leading-tight text-forest font-display">
          {product.title}
        </h1>
        <span className="inline-flex items-center gap-1 rounded-full bg-honey/95 px-3 py-1 font-display font-black text-[0.62rem] uppercase tracking-[0.12em] text-forest">
          <Leaf className="h-2.5 w-2.5 text-forest/70" aria-hidden="true" />
          Harvested today
        </span>
      </div>
    </header>
  );
};

export default ProductMobileHeader;