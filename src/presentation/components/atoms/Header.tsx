import React from 'react';

const Header: React.FC = () => (
  <header className="bg-gray-900 sticky top-0 z-50 shadow">
    <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
      <div className="text-white font-bold text-lg">🌾 Farm Marketplace</div>
      <nav className="space-x-4 text-sm text-gray-300">
        <a href="#products" className="hover:text-white">Products</a>
        <a href="#categories" className="hover:text-white">Categories</a>
        <a href="#subscriptions" className="hover:text-white">Subscriptions</a>
        <button className="bg-green-600 hover:bg-green-500 px-4 py-1 rounded text-white">Sell Products</button>
      </nav>
    </div>
  </header>
);

export default Header;
