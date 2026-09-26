import React, { useState } from 'react';
import type { ProductCategory } from '../../../domain/types/product';
import { useProducts } from '../../../application/hooks/useProducts';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import ProductCard from '../atoms/ProductCard';
import ProductList from './ProductList';
import ProductToolbar from './ProductToolbar';

type ProdView = 'grid' | 'list';

interface GridViewProductProps {
  activeCategory?: ProductCategory | 'all';
  onCategoryChange?: (category: ProductCategory | 'all') => void;
}

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
    <p className="col-span-full text-center text-soil/60 py-16 font-display italic text-lg">
      No {currentCategory === 'all' ? 'products' : currentCategory} match &ldquo;{searchQuery}&rdquo;.
      <br /><span className="not-italic font-bold text-clay text-base">Try a different search or category.</span>
    </p>
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

  if (isLoading) return (
    <section id="products" className="px-4 scroll-mt-16">
      {toolbar}
    </section>
  );

  if (isError) {
    return (
      <section id="products" className="px-4 scroll-mt-16">
        <div className="max-w-7xl mx-auto text-center py-20">
          <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Shop</p>
          <h2 className="mt-3 text-3xl font-black text-forest font-display">Something went wrong</h2>
          <Alert variant="destructive" className="max-w-md mx-auto mt-6 text-left">
            <AlertTitle>We could not reach the market.</AlertTitle>
            <AlertDescription className="pt-1">
              Please try again in a moment.
              <Button className="mt-4 block w-fit" onClick={() => window.location.reload()}>Try again</Button>
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