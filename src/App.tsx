import { useState, useEffect } from 'react';
import { Product } from './domain/entities/Product.js';
import SearchBar from './presentation/components/atoms/SearchBar.js';
import CategoryPill from './presentation/components/atoms/CategoryPill.js';
import ProductCard from './presentation/components/molecules/ProductCard.js';
import Layout from './presentation/layouts/Layout.js';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => setProducts(d.products || d))
      .catch(console.error);
  }, []);

  const categories = ['All', 'Farm', 'Fisheries', 'Agriculture'];

  const filtered = products.filter(p =>
    (activeCategory === 'All' || p.category === activeCategory) &&
    !query || p.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Layout>
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <h1>Products</h1>
        <SearchBar value={query} onChange={setQuery} />
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          {categories.map(c => (
            <CategoryPill key={c} label={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '24px' }}>
          {filtered.map((p: Product) => (
            <ProductCard key={p.id} product={p} onAddToCart={(id) => alert(p.title + ' added!')} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
