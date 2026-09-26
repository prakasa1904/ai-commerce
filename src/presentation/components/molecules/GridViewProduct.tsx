import React, { useState } from 'react';
import type { ProductCategory } from '../../../domain/types/product';
import { useProducts } from '../../../application/hooks/useProducts';
import { Input } from '../ui/input';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import Pill from '../atoms/Pill';
import ProductCard from './ProductCard';

const categories: ProductCategory[] = ['vegetables', 'fruits', 'grains', 'dairy', 'livestock', 'organic', 'supplies'];

const GridViewProduct: React.FC<{
  activeCategory: ProductCategory | 'all';
  onCategoryChange: (category: ProductCategory | 'all') => void;
}> = ({ activeCategory, onCategoryChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: products, isLoading, isError } = useProducts();

  const filteredProducts = products?.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesCategory && p.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const grid = (label: string) => (
    <section id="products" className="px-4 scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">{label}</p>
          <h2 className="mt-3 text-3xl font-black text-forest font-display">Today's harvest</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Input type="text" placeholder="Search tomatoes, rice, eggs…" value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded-full bg-card border-wheat/80 text-soil placeholder-soil/40" />
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Pill label="All" active={activeCategory === 'all'} onClick={() => onCategoryChange('all')} />
            {categories.map((cat) => (
              <Pill key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                active={activeCategory === cat} onClick={() => onCategoryChange(cat)} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredProducts?.length ? (
            filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <p className="col-span-full text-center text-soil/60 py-16 font-display italic text-lg">
              No {activeCategory === 'all' ? 'products' : activeCategory} match “{searchQuery}”.
              <br /><span className="not-italic font-bold text-clay text-base">Try a different search or category.</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );

  if (isLoading) return grid('Shop');
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

  return grid('Featured');
};

export default GridViewProduct;