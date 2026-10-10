import type { Product, ProductCategory } from '../../domain/types/product';
import { Link } from '@tanstack/react-router';
import ProductCard from '../../presentation/components/atoms/ProductCard';
import { categoryLabels } from './productUtils';

interface RelatedProductsSectionProps {
  products: Product[];
  category: ProductCategory;
}

const RelatedProductsSection = ({ products, category }: RelatedProductsSectionProps) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-2 mb-8">
          <div>
            <p className="font-display text-xs font-black uppercase tracking-[0.25em] text-honey">
              Harvest &middot; related
            </p>
            <h2 className="font-display font-black text-3xl text-forest mt-1">From the same field</h2>
            <p className="text-sm text-soil/60 mt-1">
              More {categoryLabels[category].toLowerCase()} picked this morning
            </p>
          </div>
          <Link
            to="/cat/$categoryID"
            params={{ categoryID: category }}
            className="font-display text-xs font-black uppercase tracking-[0.18em] text-pine hover:text-clay transition-colors"
          >
            Browse all {categoryLabels[category]} &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProductsSection;