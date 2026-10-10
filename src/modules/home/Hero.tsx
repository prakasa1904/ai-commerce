import React from 'react';
import { useProducts } from '../../application/hooks/useProducts';
import { formatPrice, unitOf } from '../product/productUtils';
import type { Product } from '../../domain/types/product';
import BrandSeal from '../../presentation/components/atoms/BrandSeal';
import { Skeleton, SkeletonText } from '../../presentation/components/ui/skeleton';

const TicketRow: React.FC<{ product?: Product }> = ({ product }) => (
  <li className="flex items-baseline justify-between gap-4">
    <span className="flex items-baseline gap-3">
      {product ? (
        <>
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-honey shadow-[0_0_6px_rgba(227,167,47,0.9)]"
          />
          <span className="font-display font-semibold text-sm text-forest tracking-tight">{product.title}</span>
        </>
      ) : (
        <>
          <Skeleton className="h-2.5 w-2.5 shrink-0 rounded-full" />
          <SkeletonText className="w-32 sm:w-44" />
        </>
      )}
    </span>
    {product ? (
      <span className="font-display font-black text-base text-clay tabular-nums tracking-tight">
        {formatPrice(product.price)} / {unitOf(product.description)}
      </span>
    ) : (
      <SkeletonText className="w-28 shrink-0 tabular-nums" />
    )}
  </li>
);

const Hero: React.FC = () => {
  const { data: products, isLoading } = useProducts();

  const today = products?.slice(0, 3);
  const crateTotal = today?.reduce((sum, p) => sum + p.price, 0) ?? 0;

  return (
    <section
      id="top"
      aria-label="Today's harvest"
      className="relative overflow-hidden bg-forest scroll-mt-16"
      style={{
        backgroundImage:
          'linear-gradient(rgba(31,59,44,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(31,59,44,0.18) 1px, transparent 1px)',
        backgroundSize: '100% 44px, 44px 100%',
      }}
    >
      <div className="absolute inset-0 -z-10">
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 h-96 w-full bg-pine/40"
          style={{ background: 'radial-gradient(900px 320px at 85% 0%, rgba(255, 167, 47, 0.16), transparent 55%)' }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 h-96 w-full"
          style={{ background: 'radial-gradient(800px 340px at 10% 100%, rgba(122, 155, 109, 0.22), transparent 55%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <BrandSeal />
            <p className="mt-6 font-display text-honey font-bold text-sm tracking-[0.35em] uppercase">Picked at dawn</p>
            <h1 className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] text-cream font-display">
              Today's harvest,
              <span className="block text-honey">written up &amp; sealed.</span>
            </h1>
            <p className="mt-6 text-lg text-cream/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Seven stalls, one crate. From the field to your table the same afternoon — no middlemen, no early-morning
              alarms.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a
                href="#products"
                className="bg-honey hover:bg-[#d98f1a] text-forest font-bold px-9 py-3.5 rounded-full transition-colors shadow-lg"
              >
                See today's stalls
              </a>
              <a
                href="#subscriptions"
                className="border-2 border-moss/50 text-cream font-bold px-9 py-3.5 rounded-full hover:border-honey hover:text-honey transition-colors"
              >
                Subscribe &amp; save 15%
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div aria-hidden="true" className="absolute -inset-6 -z-0 bg-forest rounded-[32px] rotate-1 shadow-2xl border border-moss/20" />
            <div className="relative bg-wheat rounded-[32px] border border-[#E7D9AE]/60 p-6 lg:p-8 shadow-2xl">
              <div className="border-b-2 border-[#E7D9AE]/60 pb-4 mb-4 flex items-baseline justify-between gap-4">
                <span className="font-display font-black text-[10px] tracking-[0.35em] uppercase text-soil">Harvest ticket</span>
                <span className="font-display text-[10px] tracking-[0.2em] uppercase text-clay/80">Same-day</span>
              </div>
              <ul className="space-y-3.5">
                {isLoading || !products
                  ? [0, 1, 2].map((i) => <TicketRow key={i} />)
                  : products.slice(0, 3).map((product) => <TicketRow key={product.id} product={product} />)}
              </ul>
              <div className="mt-5 flex items-center justify-between border-t border-[#E7D9AE]/60 pt-4">
                <span className="font-display text-[10px] uppercase tracking-[0.25em] text-soil/80">
                  Total for one crate
                </span>
                {isLoading || !products ? (
                  <SkeletonText className="w-24 shrink-0" />
                ) : (
                  <span className="font-display font-black text-lg text-forest">{formatPrice(crateTotal)}</span>
                )}
              </div>
            </div>
            <div aria-hidden="true" className="absolute -bottom-6 -left-6 h-20 w-20 bg-moss/90 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;