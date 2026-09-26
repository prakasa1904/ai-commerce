import React from 'react';

const Header: React.FC = () => (
  <header className="sticky top-0 z-50 bg-forest/95 backdrop-blur border-b border-forest/60">
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="#top" className="group flex items-center gap-3" aria-label="Farm Marketplace home">
        <svg className="w-9 h-9 text-honey" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
          <path d="M24 4C17 12 12 20 12 28v8a4 4 0 0 0 4 4h7l2 10 9-12a4 4 0 0 0-2-6.9 8 8 0 0 1-.4-1.8L38 30h2a4 4 0 0 0 4-4v-8c0-8-5-16-12-20z" />
          <circle cx="24" cy="28" r="3" fill="#F6F1E4" />
        </svg>
        <span>
          <span className="block font-display text-xl font-extrabold text-cream tracking-tight">Farm</span>
          <span className="block font-display -mt-1 text-sm font-bold text-honey tracking-[0.35em] uppercase">Marketplace</span>
        </span>
      </a>
      <nav className="hidden sm:flex items-center gap-6 text-sm">
        <a href="#products" className="text-cream/85 hover:text-cream transition-colors">Shop</a>
        <a href="#categories" className="text-cream/85 hover:text-cream transition-colors">Categories</a>
        <a href="#subscriptions" className="text-cream/85 hover:text-cream transition-colors">Subscribe</a>
        <button className="bg-honey hover:bg-[#d98f1a] text-forest font-bold px-4 py-1.5 rounded-full text-sm transition-colors">Sell your harvest</button>
      </nav>
    </div>
  </header>
);

export default Header;