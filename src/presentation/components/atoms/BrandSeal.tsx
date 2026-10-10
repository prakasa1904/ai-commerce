import React from 'react';
import { Leaf } from 'lucide-react';

const BrandSeal: React.FC = () => (
  <span
    aria-label="Farm Marketplace wax seal"
    className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[#1E3B2C]/20 bg-honey shadow-sm"
  >
    <Leaf className="h-10 w-10 text-forest/85" aria-hidden="true" />
    <span
      aria-hidden="true"
      className="pointer-events-none absolute h-7 w-7 rounded-full border-2 border-transparent opacity-70 border-t-white/50 rotate-45 translate-y-[-5px]"
    />
  </span>
);

export default BrandSeal;