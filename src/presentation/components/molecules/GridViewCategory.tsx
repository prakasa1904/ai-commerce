import React from 'react';
import type { ProductCategory } from '../../../domain/types/product';

export type CategoryLink = ProductCategory | 'all';

const categories = [
  { name: 'Vegetables', icon: '🥬', link: 'vegetables' },
  { name: 'Fruits', icon: '🍓', link: 'fruits' },
  { name: 'Grains', icon: '🌾', link: 'grains' },
  { name: 'Dairy', icon: '🧀', link: 'dairy' },
  { name: 'Livestock', icon: '🐄', link: 'livestock' },
  { name: 'Organic', icon: '🌱', link: 'organic' },
  { name: 'Supplies', icon: '🛠️', link: 'supplies' },
] as const;

interface CategoryCardProps {
  category: { name: string; icon: string; link: CategoryLink };
  onClick: (link: CategoryLink) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(category.link)}
    className="group p-5 rounded-2xl bg-cream border border-wheat/60 hover:border-moss/40 hover:shadow-md transition-all flex flex-col items-center text-center"
  >
    <span className="text-3xl mb-2 transition-transform group-hover:scale-110 group-hover:-rotate-6">{category.icon}</span>
    <span className="font-display font-bold text-forest text-sm">{category.name}</span>
  </button>
);

interface CategoryGridProps {
  onSelect: (link: CategoryLink) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelect }) => (
  <section id="categories" className="py-12 px-4 scroll-mt-16">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Categories</p>
        <h2 className="mt-3 text-3xl font-black text-forest font-display">What is in season</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.link} category={category} onClick={onSelect} />
        ))}
      </div>
    </div>
  </section>
);

export default CategoryGrid;