import React from 'react';
import { useRouter } from '@tanstack/react-router';
import GridViewCategory from '../../presentation/components/molecules/GridViewCategory';
import GridViewProduct from '../../presentation/components/molecules/GridViewProduct';

const CategoryPage: React.FC = () => {
  const router = useRouter();

  return (
    <section className="px-4 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Category</p>
          <h2 className="mt-3 text-3xl font-black text-forest font-display">Browse the aisle</h2>
        </div>
        <GridViewCategory
          onSelect={(link) => {
            if (link !== 'all') {
              void router.navigate({ to: '/cat/$categoryId', params: { categoryId: link } });
            }
          }}
        />
        <GridViewProduct />
      </div>
    </section>
  );
};

export default CategoryPage;