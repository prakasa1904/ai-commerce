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
  active: boolean;
  onClick: (link: ProductCategory) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, active, onClick }) => {
  const Mark = categoryMarks[category.link];

  return (
    <button
      type="button"
      onClick={() => onClick(category.link)}
      aria-label={active ? `Browse ${category.name}, current aisle` : `Browse ${category.name}`}
      aria-pressed={active}
      className="group relative flex flex-col items-center rounded-2xl border-2 border-wheat/50 bg-cream p-5 transition-all hover:-translate-y-1 hover:border-honey/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2"
    >
      <span aria-hidden="true" className="absolute inset-1 -z-10 bg-kraft rounded-[inherit]" />
      <span aria-hidden="true" className="absolute -top-1.5 -left-1.5 h-5 w-5 bg-honey/70 blur-sm" />
      <span
        aria-hidden="true"
        className="mb-2 rounded-full bg-kraft shadow-sm flex h-12 w-12 items-center justify-center text-forest"
      >
        <Mark />
      </span>
      <span className="font-display font-[800] text-soil text-sm">{category.name}</span>
      {active && <span className="mt-1 text-honey font-display text-lg" aria-hidden="true">✓</span>}
    </button>
  );
};

interface CategoryGridProps {
  onSelect: (link: CategoryLink) => void;
  active?: CategoryLink;
  showHeading?: boolean;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelect, active, showHeading = true }) => {
  const content = (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
      {categories.map((category) => (
        <CategoryCard key={category.link} category={category} active={active === category.link} onClick={(link: ProductCategory) => onSelect(link)} />
      ))}
    </div>
  );

  if (!showHeading) return content;

  return (
    <section id="categories" className="py-12 px-4 scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">The market aisle</p>
          <h2 className="mt-3 text-3xl font-black text-forest font-display">What's in season today</h2>
        </div>
        {content}
        <p className="mt-8 text-center text-sm text-soil/60 font-display tracking-wide uppercase">Picked this morning · delivered by evening</p>
      </div>
    </section>
  );
};

export default CategoryGrid;