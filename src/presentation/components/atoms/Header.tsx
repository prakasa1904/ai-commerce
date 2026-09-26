import React from 'react';
import { Link } from '@tanstack/react-router';
import BrandWordmark from './BrandWordmark';
import { Button } from '../ui/button';

const Header: React.FC = () => (
  <header className="sticky top-0 z-50 bg-forest/95 backdrop-blur border-b border-forest/60">
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <BrandWordmark />
      <nav className="hidden sm:flex items-center gap-6 text-sm">
        <Link to="/category" className="text-cream/85 hover:text-cream transition-colors">Shop</Link>
        <Link to="/category" className="text-cream/85 hover:text-cream transition-colors">Categories</Link>
        <Link to="/" className="text-cream/85 hover:text-cream transition-colors">Subscribe</Link>
        <Button className="bg-honey hover:bg-[#d98f1a] text-forest font-bold px-4 py-1.5 rounded-full text-sm transition-colors">
          Sell your harvest
        </Button>
      </nav>
    </div>
  </header>
);

export default Header;