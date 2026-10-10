import React, { useState } from 'react';
import type { ProductCategory } from '../../../domain/types/product';
import { useProducts } from '../../../application/hooks/useProducts';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import ProductCard from '../atoms/ProductCard';
import { ProductSkeletonCard, ProductSkeletonRow } from '../atoms/ProductSkeletons';
import ProductList from './ProductList';
import ProductToolbar from './ProductToolbar';

type ProdView = 'grid' | 'list';

interface GridViewProductProps {
  activeCategory?: ProductCategory | 'all';
  onCategoryChange?: (category: ProductCategory | 'all') => void;
}

const SKELETON_COUNT = 8;

const GridViewProduct: React.FC<GridViewProductProps> = ({
  activeCategory = 'all',
  onCategoryChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<ProdView>('grid');
  const [localCategory, setLocalCategory] = useState<ProductCategory | 'all'>(activeCategory);
  const { data: products, isLoading, isError } = useProducts();

  const currentCategory = localCategory;
  const handleCategoryChange = (category: ProductCategory | 'all') => {
    setLocalCategory(category);
    onCategoryChange?.(category);
  };

  const filteredProducts = products?.filter((p) => {
    const matchesCategory = currentCategory === 'all' || p.category === currentCategory;
    return matchesCategory && p.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const emptyMessage = (
    <div className="col-span-full flex flex-col items-center justify-center py-20">
      <div className="bg-cream rounded-2xl p-10 text-center">
        <svg width={64} height={64} viewBox="0 0 64 64" fill="none" stroke="currentColor" className="text-clay mb-6" strokeWidth={12} strokeLinecap="round" aria-hidden="true">
          <rect x="2" y="2" width="60" height="44" rx="7" />
          <line x1="12" y1="46" x2="12" y2="58" />
          <line x1="28" y1="46" x2="28" y2="58" />
          <line x1="36" y1="46" x2="36" y2="58" />
          <line x1="52" y1="46" x2="52" y2="58" />
        </svg>
        <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">This stall is empty</p>
        <h3 className="mt-4 text-2xl font-black text-forest font-display">Nothing matches that search</h3>
        <p className="mt-3 text-sm text-soil/70">Try a different word, aisle, or product above.</p>
      </div>
    </div>
  );

  const toolbar = (
    <ProductToolbar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      view={view}
      onViewChange={setView}
      activeCategory={currentCategory}
      onCategoryChange={handleCategoryChange}
    />
  );

  const content = (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Shop</p>
        <h2 className="mt-3 text-3xl font-black text-forest font-display">Today&apos;s harvest</h2>
      </div>
      {toolbar}
      {filteredProducts?.length ? (
        view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <ProductList products={filteredProducts} />
        )
      ) : (
        emptyMessage
      )}
    </div>
  );

  if (isLoading) {
    return (
      <section id="products" className="px-4 scroll-mt-16">
        <ProductToolbar
          searchQuery=""
          onSearchChange={() => {}}
          view={view}
          onViewChange={setView}
          activeCategory="all"
          onCategoryChange={() => {}}
        />
        <div className="max-w-7xl mx-auto">
          {view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <ProductSkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <ul className="grid gap-4">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <ProductSkeletonRow key={i} />
              ))}
            </ul>
          )}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section id="products" className="px-4 scroll-mt-16">
        <div className="max-w-7xl mx-auto text-center py-24">
          <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Shop</p>
          <h2 className="mt-3 text-3xl font-black text-forest font-display">Something went wrong</h2>
          <Alert variant="destructive" className="max-w-md mx-auto mt-8 text-left">
            <AlertTitle>We could not reach the market.</AlertTitle>
            <AlertDescription className="pt-1">
              Please check your connection and try again.
              <Button className="mt-4 block w-fit focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2" onClick={() => window.location.reload()}>Reload</Button>
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="px-4 scroll-mt-16">
      {content}
    </section>
  );
};

export default GridViewProduct;