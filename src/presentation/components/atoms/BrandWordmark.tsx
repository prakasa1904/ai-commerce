import React from 'react';
import { Link } from '@tanstack/react-router';
import LeafMark from './LeafMark';

const BrandWordmark: React.FC = () => (
  <Link to="/" className="group flex items-center gap-3" aria-label="Farm Marketplace home">
    <LeafMark />
    <span>
      <span className="block font-display text-xl font-extrabold text-cream tracking-tight">Farm</span>
      <span className="block font-display -mt-1 text-sm font-bold text-honey tracking-[0.35em] uppercase">Marketplace</span>
    </span>
  </Link>
);

export default BrandWordmark;