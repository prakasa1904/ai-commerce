import React from 'react';
import Header from '../atoms/Header';
import GridViewCategory from '../molecules/GridViewCategory';
import GridViewProduct from '../molecules/GridViewProduct';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-8 px-4">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Farm Marketplace</h1>
          <p className="text-xl text-gray-600 mb-4">Fresh produce from local farmers to your door</p>
          <div className="flex gap-4 justify-center">
            <a href="#products" className="bg-green-600 text-white px-6 py-3 rounded">Shop Now</a>
            <a href="#subscriptions" className="bg-gray-200 px-6 py-3 rounded">Subscribe</a>
          </div>
        </section>
        
        <GridViewCategory />
        <GridViewProduct />
        
        {/* Subscription Section */}
        <section id="subscriptions" className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 p-6 rounded">
            <h3 className="text-xl font-bold mb-2">Weekly Subscriptions</h3>
            <p className="text-gray-600 mb-4">Get 15% off on subscription orders</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded">Subscribe</button>
          </div>
          <div className="bg-yellow-50 p-6 rounded">
            <h3 className="text-xl font-bold mb-2">Wholesale</h3>
            <p className="text-gray-600 mb-4">Orders over 100kg get extra 5% off</p>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded">Request Quote</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
