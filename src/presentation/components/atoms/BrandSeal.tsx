import React from 'react';
import { Leaf } from 'lucide-react';

const BrandSeal: React.FC = () => (
  <span
    aria-label="Farm Marketplace wax seal"
    className="relative flex items-center justify-center rounded-full bg-honey shadow-sm"
    style={{ width: '56px', height: '56px', border: '2px solid rgba(31, 78, 55, 0.18)' }}
  >
    <Leaf className="h-10 w-10 text-forest/85" aria-hidden="true" />
    <span
      aria-hidden="true"
      className="pointer-events-none absolute h-7 w-7 rounded-full border-2 border-white/0 opacity-70"
      style={{ borderTopColor: 'rgba(255,255,255,0.5)', transform: 'rotate(45deg) translateY(-5px)' }}
    />
  </span>
);

export default BrandSeal;