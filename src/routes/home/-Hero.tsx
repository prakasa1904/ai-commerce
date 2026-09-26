import React from 'react';

const Hero: React.FC = () => (
  <section id="top" className="relative overflow-hidden pt-20 pb-16 px-4">
    <div className="max-w-7xl mx-auto text-center relative">
      <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Dawn to doorstep</p>
      <h1 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-black text-forest leading-[1.05] font-display">
        Fresh picked,&nbsp;
        <span className="block text-pine/90">straight to your kitchen</span>
      </h1>
      <p className="mt-6 text-lg text-soil/80 max-w-2xl mx-auto">
        Seasonal vegetables, fruits, grains and dairy from local farmers — harvested at first light and delivered the same day.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <a href="#products" className="bg-forest hover:bg-pine text-cream font-bold px-8 py-3 rounded-full transition-colors shadow-sm">Shop fresh produce</a>
        <a href="#subscriptions" className="border-2 border-forest/50 text-forest font-bold px-8 py-3 rounded-full hover:border-honey/60 hover:text-honey transition-colors">Subscribe &amp; save 15%</a>
      </div>
    </div>
    <div className="absolute -top-16 -right-20 w-72 h-72 bg-moss/20 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
    <div className="absolute -bottom-20 -left-12 w-56 h-56 bg-honey/20 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
  </section>
);

export default Hero;