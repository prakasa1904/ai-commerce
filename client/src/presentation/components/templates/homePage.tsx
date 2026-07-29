import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      {/* Header */}
      <header className="bg-white shadow-md mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img src="https://images.unsplash.com/photo-1464226184884-fa5d6b859d7a?w=100&h=100&q=80" alt="FarmLogo" className="w-10 h-10 rounded-full shadow" />
              <div>
                <span className="text-xl font-bold text-green-700">Farm</span>
                <span className="text-sm font-semibold ml-1 text-green-600">Marketplace</span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              {['Home', 'Products', 'Subscriptions', 'Wholesale'].map(item => (
                <button key={item} className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">{item}</button>
              ))}
            </nav>
            <div className="flex items-center space-x-3">
              <button className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg"><span role="img">👤</span> Sign In</button>
              <button className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg font-medium"><span role="img">🚀</span> Sell Products</button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 sm:p-12 text-center text-white mb-6">
        <h1 className="text-3xl sm:text-5xl font-bold mb-4">Fresh Farm Produce<br /><span className="text-green-200">Delivered to Your Door</span></h1>
        <p className="text-lg mb-8 max-w-2xl mx-auto">Connecting local farmers with community members and B2B buyers</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#products" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg shadow transition">Browse Products</a>
          <a href="#subscriptions" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg shadow transition">Subscribe & Save</a>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto bg-white rounded-2xl shadow mb-6 p-4 sm:p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Product Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'Vegetables', emoji: '🥬' },
            { name: 'Fruits', emoji: '🍓' },
            { name: 'Grains', emoji: '🌾' },
            { name: 'Dairy', emoji: '🧀' },
            { name: 'Livestock', emoji: '🐄' },
            { name: 'Organic', emoji: '🌱' },
            { name: 'Supplies', emoji: '🛠️' },
            { name: 'All Products', emoji: '📦' }
          ].map((cat, i) => (
            <a key={i} href={`#${cat.name.toLowerCase()}`} className="flex flex-col items-center p-4 bg-slate-50 rounded-lg hover:bg-green-50 transition">
              <span className="text-3xl mb-2">{cat.emoji}</span>
              <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto bg-white rounded-2xl shadow mb-6 p-4 sm:p-8">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <p className="text-gray-600 mb-8">Fresh from local farms to your table</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 1, name: 'Organic Tomatoes', price: 25000, unit: 'kg', stock: 150, warehouse: true },
            { id: 2, name: 'Fresh Strawberries', price: 50000, unit: '250g', stock: 89, warehouse: true },
            { id: 3, name: 'Premium Rice', price: 15000, unit: '5kg', stock: 200, warehouse: true },
            { id: 4, name: 'Fresh Milk', price: 18000, unit: 'liter', stock: 120, warehouse: false },
            { id: 5, name: 'Grass-Fed Eggs', price: 22000, unit: 'dozen', stock: 95, warehouse: true },
            { id: 6, name: 'Organic Spinach', price: 12000, unit: 'bunch', stock: 200, warehouse: false },
            { id: 7, name: 'Banana Bunch', price: 15000, unit: 'bunch', stock: 75, warehouse: true },
            { id: 8, name: 'Organic Fertilizer', price: 80000, unit: 'bag', stock: 50, warehouse: true }
          ].map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 border border-gray-100">
              <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                <img src={`https://placehold.co/400x400/22c55e/ffffff?text=${p.name}`} alt={p.name} className="w-full h-full object-cover" />
              </div>
              {p.warehouse && <span className="inline-block bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">Wholesale</span>}
              <h3 className="font-bold text-lg mb-1">{p.name}</h3>
              <p className="text-sm text-gray-600 mb-2">Green Valley Farm</p>
              <p className="text-sm text-gray-500 mb-2">Jakarta</p>
              <p className="text-2xl font-bold text-green-700 mb-2">Rp {p.price.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mb-3">/ {(p.unit)}</p>
              <div className="flex items-center justify-between mt-auto">
                <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium transition w-1/2">Add to Cart</button>
                {p.warehouse && <button className="border-2 border-green-600 hover:bg-green-50 text-green-600 px-3 py-2 rounded-md text-xs font-medium transition w-1/2">Bulk Quote</button>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subscriptions & Wholesale */}
      <section className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-green-50 rounded-2xl p-8 hover:shadow-lg transition">
          <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">Subscription</span>
          <h3 className="text-2xl font-bold mb-3">Weekly Package</h3>
          <p className="text-gray-600 mb-6">Get fresh produce delivered every week. 15% off on subscription orders.</p>
          <button className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition">Start Subscription</button>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-8 hover:shadow-lg transition">
          <span className="bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">Wholesale</span>
          <h3 className="text-2xl font-bold mb-3">B2B Wholesale</h3>
          <p className="text-gray-600 mb-6">Special pricing for bulk orders. Orders over 100kg get extra 5% off.</p>
          <button className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition">Request Wholesale Quote</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto bg-slate-900 text-slate-300 rounded-2xl p-8 mt-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="text-xl font-bold text-white">Farm</span><span className="text-green-400 font-bold">Marketplace</span>
            <p className="mt-4 text-sm">Connecting local farmers with community members and businesses since 2024.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Products</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Categories</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Subscriptions</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Seller Hub</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Become a Seller</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm border-t border-slate-800 pt-6">
          <p>© 2024 Farm Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
