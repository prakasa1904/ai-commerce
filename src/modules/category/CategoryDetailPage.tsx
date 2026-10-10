import React from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import type { ProductCategory } from '../../domain/types/product';
import GridViewProduct from '../../presentation/components/molecules/GridViewProduct';
import AisleHeader from '../../presentation/components/atoms/AisleHeader';
import categoryMarks from '../../presentation/components/atoms/CategoryMark';
import { categoryLabels, categoryCopy } from '../product/productUtils';

interface CategoryDetailPageProps {
  categoryId: ProductCategory;
}

const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({ categoryId }) => {
  const router = useRouter();
  const Mark = categoryMarks[categoryId];

  return (
    <main className="flex-1">
      <section className="px-4 py-10 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <AisleHeader title={categoryLabels[categoryId]} copy={categoryCopy[categoryId]}>
            <Mark />
          </AisleHeader>
          <div className="mt-6">
            <Link
              to="/cat"
              className="font-display text-xs font-black uppercase tracking-[0.18em] text-pine hover:text-clay transition-colors"
            >
              &larr; Back to the aisles
            </Link>
          </div>
        </div>
      </section>
      <GridViewProduct
        activeCategory={categoryId}
        onCategoryChange={(category) => {
          if (category === 'all') {
            void router.navigate({ to: '/cat' });
          } else if (category !== categoryId) {
            void router.navigate({ to: '/cat/$categoryID', params: { categoryID: category } });
          }
        }}
      />
    </main>
  );
};

export default CategoryDetailPage;