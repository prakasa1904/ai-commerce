import React from 'react';
import type { Product } from '../../../domain/types/product';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const ProductRow: React.FC<{ product: Product }> = ({ product }) => {
  const imageUrl = product.imageUrl ?? 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Farm+Fresh';

  return (
    <li className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-card border border-wheat/60 hover:border-moss/40 hover:shadow-md transition-all">
      <div className="flex-shrink-0 h-40 w-full sm:w-44 overflow-hidden rounded-xl bg-forest/5">
        <img
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 sm:gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-foreground text-lg">{product.title}</h3>
          <Badge
            variant="secondary"
            className="inline-block bg-forest/85 text-cream/90 text-[0.62rem] tracking-[0.18em]"
          >
            {product.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="font-display font-black text-2xl text-pine">Rp{product.price.toLocaleString()}</span>
          <span className="text-[0.7rem] font-display font-bold text-clay tracking-wide">/kg</span>
        </div>
      </div>
      <div className="flex-shrink-0">
        <Button
          variant="secondary"
          className="w-full sm:w-44 rounded-full border-none bg-pine/95 text-cream font-bold hover:bg-pine hover:text-cream transition-colors"
          onClick={() => console.log(`${product.title} added to cart!`)}
        >
          Add to Cart
        </Button>
      </div>
    </li>
  );
};

const ProductList: React.FC<{ products: Product[] }> = ({ products }) => (
  <ul className="grid gap-4">
    {products.map((p) => (
      <ProductRow key={p.id} product={p} />
    ))}
  </ul>
);

export default ProductList;