import React from 'react';

const categories = [
  { name: 'Vegetables', icon: '🥬' },
  { name: 'Fruits', icon: '🍓' },
  { name: 'Grains', icon: '🌾' },
  { name: 'Dairy', icon: '🧀' },
  { name: 'Livestock', icon: '🐄' },
  { name: 'Organic', icon: '🌱' },
  { name: 'Supplies', icon: '🛠️' }
];

const GridViewCategory: React.FC = () => (
  <section id="categories" className="py-8">
    <h2 className="text-2xl font-bold mb-6">Product Categories</h2>
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
      {categories.map((cat) => (
        <div key={cat.name} className="bg-white p-4 rounded hover:bg-green-50 text-center">
          <div className="text-3xl mb-2">{cat.icon}</div>
          <p className="font-medium">{cat.name}</p>
        </div>
      ))}
    </div>
  </section>
);

export default GridViewCategory;
