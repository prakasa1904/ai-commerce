import React from 'react';
import type { Product } from '../../domain/types/product';
import { Button } from '../../presentation/components/ui/button';

interface ProductDetailProps {
  product: Product;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const imageUrl = product.imageUrl ?? 'https://dummyimage.com/800x500/3E6B4F/FBF8F1&text=Farm+Fresh';

  return (
    <section className="px-4 py-10 scroll-mt-16">
      <div className="max-w-5xl mx-auto">
        <Button variant="secondary" className="mb-6 px-4 py-2" onClick={() => history.back()}>
          &larr; Back
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="rounded-xl overflow-hidden border border-wheat/60">
            <img
              src={imageUrl}
              alt={product.title}
              loading="lazy"
              className="w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-black text-forest font-display">{product.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            <p className="font-display text-4xl font-black text-pine">Rp{product.price.toLocaleString()}</p>
            <Button
              className="w-fit bg-pine/95 text-cream font-bold hover:bg-pine transition-colors px-6 py-3"
              onClick={() => console.log(`${product.title} added to cart!`)}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;