import React, { useState } from 'react';
import type { ProductCategory } from '../../../domain/types/product';
import { useProducts } from '../../../application/hooks/useProducts';
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
          <input type="text" placeholder="Search tomatoes, rice, eggs…"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-5 py-3 border border-wheat/80 rounded-full bg-cream text-soil placeholder-soil/40 focus:outline-none focus:ring-2 focus:ring-moss/40" />
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
              <br />
              <span className="not-italic font-bold text-clay text-base">Try a different search or category.</span>
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
          <p className="mt-4 text-soil/70">We could not reach the market. Please try again in a moment.</p>
          <button type="button" onClick={() => window.location.reload()}
            className="mt-6 bg-forest hover:bg-pine text-cream font-bold px-6 py-2.5 rounded-full transition-colors">
            Try again
          </button>
        </div>
      </section>
    );
  }

  return grid('Featured');
};

export default GridViewProduct;