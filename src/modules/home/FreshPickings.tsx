import React, { useMemo } from 'react';
import type { Product } from '../../domain/types/product';
import { useProducts } from '../../application/hooks/useProducts';
import { Link } from '@tanstack/react-router';
import { Alert, AlertTitle, AlertDescription } from '../../presentation/components/ui/alert';
import { Button } from '../../presentation/components/ui/button';
import ProductCard from '../../presentation/components/atoms/ProductCard';
import { ProductSkeletonCard } from '../../presentation/components/atoms/ProductSkeletons';

const PIKINGS_LIMIT = 8;

const shuffleProducts = (products: Product[]): Product[] => {
  const result = [...products];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const FreshPickings: React.FC = () => {
  const { data: products, isLoading, isError } = useProducts();

  const pickings = useMemo(
    () => (products ? shuffleProducts(products).slice(0, PIKINGS_LIMIT) : undefined),
    [products],
  );

  if (isLoading) {
    return (
      <section id="fresh-pickings" aria-label="Fresh pickings from the market" className="px-4 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {Array.from({ length: PIKINGS_LIMIT }).map((_, i) => (
              <ProductSkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section id="fresh-pickings" aria-label="Fresh pickings from the market" className="px-4 scroll-mt-16">
        <div className="max-w-7xl mx-auto text-center py-24">
          <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Fresh pickings</p>
          <h2 className="mt-3 text-3xl font-black text-forest font-display">Something went wrong</h2>
          <Alert variant="destructive" className="max-w-md mx-auto mt-8 text-left">
            <AlertTitle>We could not reach the market.</AlertTitle>
            <AlertDescription className="pt-1">
              Please check your connection and try again.
              <Button className="mt-4 block w-fit focus-visible:outline-2 focus-visible:outline-forest focus-visible:outline-offset-2" onClick={() => window.location.reload()}>Reload</Button>
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  return (
    <section id="fresh-pickings" aria-label="Fresh pickings from the market" className="px-4 scroll-mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Fresh pickings</p>
          <h2 className="mt-3 text-3xl font-black text-forest font-display">Straight from the field</h2>
          <p className="mt-3 text-sm text-soil/70">A rotating crate of in-season picks, restocked every morning from local stalls.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {pickings && pickings.length > 0 ? (
            pickings.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="bg-cream rounded-2xl p-10 text-center">
                <svg width={64} height={64} viewBox="0 0 64 64" fill="none" stroke="currentColor" className="text-clay mb-6" strokeWidth={12} strokeLinecap="round" aria-hidden="true">
                  <rect x="2" y="2" width="60" height="44" rx="7" />
                  <line x1="12" y1="46" x2="12" y2="58" />
                  <line x1="28" y1="46" x2="28" y2="58" />
                  <line x1="36" y1="46" x2="36" y2="58" />
                  <line x1="52" y1="46" x2="52" y2="58" />
                </svg>
                <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">This stall is empty</p>
                <h3 className="mt-4 text-2xl font-black text-forest font-display">Nothing to pick right now</h3>
                <p className="mt-3 text-sm text-soil/70">Check back tomorrow, or browse the full market for today&apos;s harvest.</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-10 text-center">
          <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Rotates daily</p>
          <Link to="/cat" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-forest underline-offset-4 hover:underline">Browse the market →</Link>
        </div>
      </div>
    </section>
  );
};

export default FreshPickings;