import React from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '../ui/button';

const NotFoundPage: React.FC = () => (
  <div className="px-4 py-20 text-center">
    <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">404</p>
    <h1 className="mt-3 text-4xl font-black text-forest font-display">Product not found</h1>
    <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
      That harvest hasn&apos;t arrived at the market yet.
    </p>
    <Link to="/" className="mt-8">
      <Button className="bg-pine/95 text-cream font-bold hover:bg-pine transition-colors px-6 py-3">
        Browse the market
      </Button>
    </Link>
  </div>
);

export default NotFoundPage;