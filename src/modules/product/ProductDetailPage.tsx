import React, { useState } from 'react';
import { CalendarHeart, Leaf, Minus, Plus, ShieldCheck, Truck } from 'lucide-react';
import { Link, useRouter } from '@tanstack/react-router';
import type { Product, ProductCategory } from '../../domain/types/product';
import { Button } from '../../presentation/components/ui/button';
import { Badge } from '../../presentation/components/ui/badge';

const categoryLabels: Record<ProductCategory, string> = {
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  grains: 'Grains',
  dairy: 'Dairy',
  livestock: 'Livestock',
  organic: 'Certified Organic',
  supplies: 'Farm Supplies',
};

const guarantees = [
  { icon: Leaf, label: 'Hand-picked', desc: 'Picked at first light by local farmers' },
  { icon: Truck, label: 'Free delivery', desc: 'Doorstep delivery on every order' },
  { icon: ShieldCheck, label: 'Farm fresh', desc: 'Harvested to order, not to shelf' },
];

const crumbColor = 'text-muted-foreground/80 hover:text-soil';

const unitOf = (description: string): string => {
  const match = description.match(/((\d+\s*(kg|g|L|pcs|tray)))\s*$/i);
  return match ? match[1] : 'unit';
};

interface ProductDetailProps {
  product: Product;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const imageUrl = product.imageUrl ?? 'https://dummyimage.com/800x600/1E3B2C/FBF8F1&text=Farm+Fresh';

  const price = (qty * product.price).toLocaleString('id-ID');

  return (
    <div className="px-4 pb-24 motion-reduce:transition-none">
      <div className="max-w-7xl mx-auto">
        <nav aria-label="Breadcrumb" className="py-10 text-sm animate-in fade-in duration-500">
          <ol className="flex flex-wrap items-center gap-1 max-w-5xl">
            <li>
              <Link
                to="/"
                className={`flex items-center gap-1.5 transition-colors ${crumbColor}`}
              >
                <span className="text-honey">&larr;</span> Farm Marketplace
              </Link>
            </li>
            <li aria-hidden="true" className="text-moss">/</li>
            <li>
              <Link
                to="/cat/$categoryID"
                params={{ categoryID: product.category }}
                className={`transition-colors ${crumbColor}`}
              >
                {categoryLabels[product.category]}
              </Link>
            </li>
            <li aria-hidden="true" className="text-moss">/</li>
            <li aria-current="page" className="text-forest font-semibold">
              {product.title}
            </li>
          </ol>
        </nav>

        <main className="grid lg:grid-cols-[14rem_1fr] items-start gap-8 animate-in fade-in duration-500">
          <figure className="hidden lg:block rounded-2xl border border-wheat/60 bg-card overflow-hidden shadow-sm group">
            <div className="aspect-[4/5] overflow-hidden bg-forest/5">
              <img
                src={imageUrl}
                alt={product.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="p-5 flex flex-wrap items-center gap-2">
              {product.wholesale ? (
                <Badge className="bg-honey/90 text-forest">
                  Wholesale <Leaf className="h-3.5 w-3.5" />
                </Badge>
              ) : (
                <Badge className="border-moss/40 bg-cream text-leaf">Farm Fresh</Badge>
              )}
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-display font-black text-clay uppercase tracking-wide">
                <CalendarHeart className="h-3.5 w-3.5" /> Today&apos;s harvest
              </span>
            </div>
          </figure>

          <section className="flex flex-col gap-7">
            <header className="lg:hidden grid grid-cols-[1fr_4rem] items-center gap-4">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-card border border-wheat/60">
                <img
                  src={imageUrl}
                  alt={product.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-5">
                <p className="font-display text-xs font-black uppercase tracking-[0.2em] text-honey">
                  {categoryLabels[product.category]}
                </p>
                <h1 className="text-xl font-black leading-tight text-forest font-display">
                  {product.title}
                </h1>
              </div>
            </header>

            <div className="flex flex-col gap-3 lg:pr-6">
              <div className="hidden lg:flex items-center gap-4">
                <Badge className="bg-honey/90 text-forest">
                  {product.wholesale ? 'Wholesale' : 'Farm Fresh'}
                </Badge>
                <span className="inline-flex items-center gap-1.5 text-xs font-display font-black uppercase tracking-wide text-moss">
                  <CalendarHeart className="h-3.5 w-3.5" /> Harvested today
                </span>
              </div>
              <p className="text-base leading-relaxed text-soil/75">{product.description}</p>
              <div className="border-t border-wheat/60" />
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
                <div>
                  <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Price</dt>
                  <dd className="mt-1 text-2xl font-display font-black text-pine">
                    Rp{product.price.toLocaleString('id-ID')}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Unit</dt>
                  <dd className="mt-1 text-sm font-display font-bold text-clay tracking-wide">/{unitOf(product.description)}</dd>
                </div>
                <div>
                  <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Origin</dt>
                  <dd className="mt-1 text-sm font-semibold text-forest">Local Farm</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl bg-card border border-wheat/60 p-6 md:p-8 shadow-sm lg:sticky top-24">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[0.7rem] font-display font-black uppercase tracking-[0.18em] text-muted-foreground">
                        Price
                      </p>
                      <p className="mt-1 text-4xl font-display font-black text-forest">
                        Rp{product.price.toLocaleString('id-ID')}
                        <span className="ml-2 text-sm font-display font-bold text-muted-foreground">/{unitOf(product.description)}</span>
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground">Harvest to doorstep, same day.</p>
                      <div className="mt-2 inline-flex gap-1.5 text-[0.7rem] text-soil/70">
                        <span className="inline-flex items-center gap-1 bg-moss/15 text-forest px-2 py-0.5 rounded-full">In season</span>
                        {product.wholesale && (
                          <span className="inline-flex items-center gap-1 bg-honey/25 text-forest px-2 py-0.5 rounded-full">Wholesale</span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <label htmlFor="qty" className="sr-only">Quantity</label>
                      <div className="flex items-center gap-2 rounded-xl bg-wheat/60 border border-wheat/40 p-1.5 shadow-sm">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-forest transition-colors hover:bg-forest/8"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span
                          id="qty"
                          className="w-7 text-center tabular-nums font-display font-black text-forest text-sm"
                          aria-live="polite"
                        >
                          {qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQty((q) => q + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-forest transition-colors hover:bg-forest/8"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-12 bg-honey hover:bg-[#d98f1a] text-forest font-display font-black text-base tracking-wide rounded-full shadow-md transition-shadow duration-300 hover:shadow-lg duration-200 active:translate-y-0.5"
                    onClick={() => router.navigate({ to: '/', replace: true })}
                  >
                    Add to Cart &mdash; Rp{price}
                  </Button>
                </div>

                <div className="mt-4 rounded-xl bg-wheat/50 border border-wheat/50 px-4 py-3 text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-forest" />
                  Secure checkout &middot; 100% farm-fresh guarantee
                </div>
              </div>
            </div>

            <section className="bg-cream/50 rounded-2xl border border-wheat/60 p-6 lg:p-8 max-w-5xl">
              <h2 className="font-display text-sm font-black text-forest uppercase tracking-[0.25em] mb-5">
                Why farm fresh?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-8">
                {guarantees.map((g) => (
                  <div key={g.label} className="flex gap-4 items-start">
                    <div className="shrink-0 mt-0.5 h-10 w-10 rounded-full bg-forest/10 text-forest flex items-center justify-center">
                      <g.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-lg text-forest">{g.label}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-soil/70">{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </section>
        </main>

        <aside
          className="lg:hidden fixed inset-x-0 bottom-0 bg-cream/95 border-t border-wheat/60 backdrop-blur z-[45] px-4 py-3"
          aria-label="Purchase actions"
        >
          <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-display font-black text-muted-foreground">Total:</span>
              <span className="text-xl font-display font-black text-forest">Rp{price}</span>
            </div>
            <Button
              size="lg"
              className="h-12 min-w-[10rem] bg-honey hover:bg-[#d98f1a] text-forest font-display font-black transition-colors rounded-full"
              onClick={() => router.navigate({ to: '/', replace: true })}
            >
              Add to Cart
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProductDetail;