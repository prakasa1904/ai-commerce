import React from 'react';
import { ALL_CATEGORIES } from '../../../domain/types/product';
import categoryMarks from './CategoryMark';

const Footer: React.FC = () => (
  <footer className="border-t border-forest/60 bg-forest shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <svg className="h-8 w-8 text-honey" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true"><path d="M24 4C17 12 12 20 12 28v8a4 4 0 0 0 4 4h7l2 10 9-12a4 4 0 0 0-2-6.9 8 8 0 0 1-.4-1.8L38 30h2a4 4 0 0 0 4-4v-8c0-8-5-16-12-20z" /><circle cx="24" cy="28" r="3" fill="#F6F1E4" /></svg>
          <span className="font-display font-extrabold text-cream text-lg">Farm Marketplace</span>
        </div>
        <p className="max-w-md text-center text-sm text-cream/60 sm:text-right">Fresh local produce from the farmers who grow it. Harvested at dawn, at your door by noon.</p>
      </div>
      <div className="mt-8 flex items-center justify-center gap-3 border-t border-forest/60 pt-8">{ALL_CATEGORIES.map((category) => { const Mark = categoryMarks[category]; return <Mark key={category} className="text-cream/60" />; })}</div>
    </div>
  </footer>
);
export default Footer;