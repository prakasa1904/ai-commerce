import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-forest border-t border-forest/60 px-4 py-10">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <svg className="w-8 h-8 text-honey" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
          <path d="M24 4C17 12 12 20 12 28v8a4 4 0 0 0 4 4h7l2 10 9-12a4 4 0 0 0-2-6.9 8 8 0 0 1-.4-1.8L38 30h2a4 4 0 0 0 4-4v-8c0-8-5-16-12-20z" />
          <circle cx="24" cy="28" r="3" fill="#F6F1E4" />
        </svg>
        <span className="font-display font-extrabold text-cream text-lg">Farm Marketplace</span>
      </div>
      <p className="text-sm text-cream/60 max-w-md text-center md:text-right">
        Fresh local produce from the farmers who grow it. Harvested at dawn, at your door by noon.
      </p>
    </div>
  </footer>
);

export default Footer;