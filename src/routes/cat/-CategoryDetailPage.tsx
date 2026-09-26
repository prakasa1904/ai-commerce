import React from 'react';
import type { ProductCategory } from '../../domain/types/product';
import GridViewProduct from '../../presentation/components/molecules/GridViewProduct';

interface CategoryDetailPageProps {
  categoryId: ProductCategory;
}

const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({ categoryId }) => (
  <section className="px-4 py-10">
    <div className="max-w-7xl mx-auto">
      <GridViewProduct
        activeCategory={categoryId}
        onCategoryChange={() => {}}
      />
    </div>
  </section>
);

export default CategoryDetailPage;