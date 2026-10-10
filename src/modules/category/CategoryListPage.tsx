import React from 'react';
import { useRouter } from '@tanstack/react-router';
import { useProducts } from '../../application/hooks/useProducts';
import AisleHeader from '../../presentation/components/atoms/AisleHeader';
import GridViewCategory from '../../presentation/components/molecules/GridViewCategory';
import ProductCard from '../../presentation/components/atoms/ProductCard';

const CategoryListPage: React.FC = () => {
  const router = useRouter();
  const { data: products } = useProducts();
  const featured = products?.slice(0, 8) ?? [];

  return (
    <main className="flex-1">
      <section id="categories" className="px-4 py-10 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <AisleHeader title="Browse the aisle" />
          <div className="mt-8">
            <GridViewCategory
              active="all"
              showHeading={false}
              onSelect={(link) => {
                if (link !== 'all') {
                  void router.navigate({ to: '/cat/$categoryID', params: { categoryID: link } });
                }
              }}
            />
            <p className="mt-8 text-center text-sm text-soil/60 font-display tracking-wide uppercase">Picked this morning · delivered by evening</p>
          </div>
        </div>
      </section>
      <section id="featured" className="px-4 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Shop</p>
            <h2 className="mt-3 text-3xl font-black text-forest font-display">Today&apos;s harvest</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default CategoryListPage;