import React from 'react';

const products = [
  { id: 1, name: 'Organic Tomatoes', price: 25000, wholesale: true },
  { id: 2, name: 'Fresh Strawberries', price: 50000, wholesale: true },
  { id: 3, name: 'Premium Rice', price: 15000, wholesale: true },
  { id: 4, name: 'Fresh Milk', price: 18000, wholesale: false },
  { id: 5, name: 'Grass-Fed Eggs', price: 22000, wholesale: true },
  { id: 6, name: 'Organic Spinach', price: 12000, wholesale: false },
];

const GridViewProduct: React.FC = () => (
  <section id="products" className="py-8">
    <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <div key={p.id} className="bg-white p-4 rounded shadow hover:shadow-lg">
          <div className="h-32 bg-gray-200 mb-3 rounded"></div>
          <h3 className="font-semibold">{p.name}</h3>
          <p className="text-2xl font-bold text-green-600">Rp {p.price.toLocaleString()}</p>
          <p className="text-sm text-gray-500">/kg</p>
          <button 
            onClick={() => alert(`${p.name} added to cart!`)}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white py-1 rounded"
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  </section>
);

export default GridViewProduct;
