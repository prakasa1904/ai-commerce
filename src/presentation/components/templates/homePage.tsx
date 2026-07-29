import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">FarmMarketplace</h1>
          <button className="bg-green-600 text-white px-4 py-2 rounded">Sell Products</button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4">
        <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
        <p className="text-gray-600 mb-4">Fresh from local farms to your table</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-lg">Product {i}</h3>
              <p className="text-green-600 font-bold">Rp 25.000</p>
              <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded">Add to Cart</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
