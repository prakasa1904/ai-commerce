import React, { useState } from 'react';
import type { ProductCategory } from '../../../domain/types/product';
import Header from '../atoms/Header';
import Hero from './Hero';
import GridViewCategory from '../molecules/GridViewCategory';
import GridViewProduct from '../molecules/GridViewProduct';
import SubscriptionBand from './SubscriptionBand';
import Footer from './Footer';

const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');

  return (
    <div className="min-h-screen flex flex-col bg-wheat">
      <Header />
      <main className="flex-1">
        <Hero />
        <GridViewCategory onSelect={setActiveCategory} />
        <GridViewProduct activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <SubscriptionBand />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;