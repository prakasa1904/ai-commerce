import React from 'react';
import type { ProductCategory } from '../../../domain/types/product';
import { ALL_CATEGORIES } from '../../../domain/types/product';
import { Input } from '../ui/input';
import ViewToggle from '../atoms/ViewToggle';
import Pill from '../atoms/Pill';

type ProdView = 'grid' | 'list';

interface ProductToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  view: ProdView;
  onViewChange: (view: ProdView) => void;
  activeCategory: ProductCategory | 'all';
  onCategoryChange: (category: ProductCategory | 'all') => void;
}

const ProductToolbar: React.FC<ProductToolbarProps> = ({
  searchQuery, onSearchChange, view, onViewChange, activeCategory, onCategoryChange,
}) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-8">
    <Input type="text" placeholder="Search tomatoes, rice, eggs…" value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      className="flex-1 rounded-full bg-card border-wheat/80 text-soil placeholder-soil/40 focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2" />
    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
      <ViewToggle view={view} onChange={onViewChange} />
      <Pill label="All" active={activeCategory === 'all'} onClick={() => onCategoryChange('all')} />
      {ALL_CATEGORIES.map((cat) => (
        <Pill key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}
          active={activeCategory === cat} onClick={() => onCategoryChange(cat)} />
      ))}
    </div>
  </div>
);

export default ProductToolbar;