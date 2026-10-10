import React, { useState } from 'react';
import type { ProductCategory } from '../../domain/types/product';
import Hero from './Hero';
import GridViewCategory from '../../presentation/components/molecules/GridViewCategory';
import GridViewProduct from '../../presentation/components/molecules/GridViewProduct';
import FreshPickings from './FreshPickings';
import SubscriptionBand from './SubscriptionBand';

const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');

  return (
    <main className="flex-1">
      <Hero />
      <GridViewCategory onSelect={setActiveCategory} active={activeCategory} />
      <GridViewProduct activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      <FreshPickings />
      <SubscriptionBand />
    </main>
  );
};

export default HomePage;