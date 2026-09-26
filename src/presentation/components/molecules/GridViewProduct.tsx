import React, { useState } from 'react';
import type { Product, ProductCategory } from '../../../domain/types/product';
import { useProducts } from '../../../application/hooks/useProducts';

const categories: ProductCategory[] = [
  'vegetables',
  'fruits',
  'grains',
  'dairy',
  'livestock',
  'organic',
  'supplies',
];

const Pill: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
      active
        ? 'bg-forest text-cream shadow-sm'
        : 'bg-cream text-soil/70 hover:text-forest hover:border-moss/50 hover:border'
    }`}
  >
    {label}
  </button>
);

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const imageUrl = product.imageUrl ?? 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Farm+Fresh';

  return (
    <div className="group relative bg-cream rounded-2xl border border-wheat/60 overflow-hidden hover:border-moss/40 hover:shadow-lg transition-all flex flex-col">
      <div className="relative h-44 overflow-hidden bg-forest/5">
        <img
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2">
          <span className="inline-block bg-forest/85 text-cream/90 text-[0.62rem] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded backdrop-blur-sm">
            {product.category}
          </span>
        </div>
        {product.wholesale && (
          <div className="absolute top-2 right-2 bg-honey/90 text-forest text-[0.62rem] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded backdrop-blur-sm">
            Wholesale
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-display font-bold text-forest text-lg leading-snug">{product.title}</h3>
        <p className="mt-1 text-sm text-soil/70 line-clamp-2">{product.description}</p>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="font-display font-black text-2xl text-pine">Rp{product.price.toLocaleString()}</span>
          <span className="text-[0.7rem] font-display font-bold text-clay tracking-wide">/kg</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => console.log(`${product.title} added to cart!`)}
        className="w-full border-t border-wheat/40 bg-pine/95 text-cream font-bold py-2.5 rounded-b-2xl hover:bg-pine hover:text-cream transition-colors text-sm"
      >
        Add to Cart
      </button>
    </div>
  );
};

const GridViewProduct: React.FC<{
  activeCategory: ProductCategory | 'all';
  onCategoryChange: (category: ProductCategory | 'all') => void;
}> = ({ activeCategory, onCategoryChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: products, isLoading, isError } = useProducts();

  const filteredProducts = products?.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sections = (label: string) => (
    <section id="products" className="px-4 scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">{label}</p>
          <h2 className="mt-3 text-3xl font-black text-forest font-display">Today's harvest</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Search tomatoes, rice, eggs…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-5 py-3 border border-wheat/80 rounded-full bg-cream text-soil placeholder-soil/40 focus:outline-none focus:ring-2 focus:ring-moss/40"
          />
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Pill label="All" active={activeCategory === 'all'} onClick={() => onCategoryChange('all')} />
            {categories.map((cat) => (
              <Pill
                key={cat}
                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                active={activeCategory === cat}
                onClick={() => onCategoryChange(cat)}
              />
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

  if (isLoading) {
    return sections('Shop');
  }

  if (isError) {
    return (
      <section id="products" className="px-4 scroll-mt-16">
        <div className="max-w-7xl mx-auto text-center py-20">
          <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Shop</p>
          <h2 className="mt-3 text-3xl font-black text-forest font-display">Something went wrong</h2>
          <p className="mt-4 text-soil/70">We could not reach the market. Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 bg-forest hover:bg-pine text-cream font-bold px-6 py-2.5 rounded-full transition-colors"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return sections('Featured');
};

export default GridViewProduct;