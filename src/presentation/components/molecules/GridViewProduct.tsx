import React, { useState } from 'react';

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  wholesale: boolean;
};

const products: Product[] = [
  { id: 1, name: 'Organic Tomatoes', price: 25000, category: 'vegetables', wholesale: true },
  { id: 2, name: 'Fresh Strawberries', price: 50000, category: 'fruits', wholesale: true },
  { id: 3, name: 'Premium Rice', price: 15000, category: 'grains', wholesale: true },
  { id: 4, name: 'Fresh Milk', price: 18000, category: 'dairy', wholesale: false },
  { id: 5, name: 'Grass-Fed Eggs', price: 22000, category: 'dairy', wholesale: true },
  { id: 6, name: 'Green Spinach', price: 12000, category: 'vegetables', wholesale: false },
  { id: 7, name: 'Banana Bunch', price: 15000, category: 'fruits', wholesale: true },
  { id: 8, name: 'Organic Fertilizer', price: 80000, category: 'supplies', wholesale: true },
];

const GridViewProduct: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', 'vegetables', 'fruits', 'grains', 'dairy', 'livestock', 'organic', 'supplies'];

  return (
    <section id="products" className="py-8">
      <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded border text-sm ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded shadow hover:shadow-lg">
            <div className="h-32 bg-green-100 mb-3 rounded"></div>
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-2xl font-bold text-green-600">Rp {p.price.toLocaleString()}</p>
            <p className="text-sm text-gray-500">/kg</p>
            <button 
              onClick={() => console.log(`${p.name} added to cart!`)}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white py-1 rounded"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GridViewProduct;
