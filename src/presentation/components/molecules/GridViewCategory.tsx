import React from 'react';
import type { ProductCategory } from '../../../domain/types/product';
import categoryMarks from '../atoms/CategoryMark';

export type CategoryLink = ProductCategory | 'all';

const categories = [
  { name: 'Vegetables', link: 'vegetables' },
  { name: 'Fruits', link: 'fruits' },
  { name: 'Grains', link: 'grains' },
  { name: 'Dairy', link: 'dairy' },
  { name: 'Livestock', link: 'livestock' },
  { name: 'Certified Organic', link: 'organic' },
  { name: 'Farm Supplies', link: 'supplies' },
] as const;

interface CategoryCardProps {
  category: { name: string; link: ProductCategory };
  onClick: (link: ProductCategory) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const Mark = categoryMarks[category.link];

  return (
    <button
      type="button"
      onClick={() => onClick(category.link)}
      aria-label={`Browse ${category.name}`}
      className="group flex flex-col items-center rounded-2xl border border-wheat-800/40 bg-cream p-5 transition-all hover:-translate-y-1 hover:border-honey/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2"
    >
      <span
        aria-hidden="true"
        className="mb-2 rounded-full bg-wheat shadow-sm flex h-12 w-12 items-center justify-center text-forest"
      >
        <Mark />
      </span>
      <span className="font-display font-[800] text-forest text-sm">{category.name}</span>
    </button>
  );
};

interface CategoryGridProps {
  onSelect: (link: CategoryLink) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelect }) => (
  <section id="categories" className="py-12 px-4 scroll-mt-16">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">The market aisle</p>
        <h2 className="mt-3 text-3xl font-black text-forest font-display">What's in season today</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.link} category={category} onClick={(link: ProductCategory) => onSelect(link)} />
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-soil/60 font-display tracking-wide uppercase">Picked this morning · delivered by evening</p>
    </div>
  </section>
);

export default CategoryGrid;