import React from 'react';
import type { Product } from '../../../domain/types/product';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const imageUrl = product.imageUrl ?? 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Farm+Fresh';

  return (
    <div className="group relative bg-cream rounded-2xl border border-wheat/60 overflow-hidden hover:border-moss/40 hover:shadow-lg transition-all flex flex-col">
      <div className="relative h-44 overflow-hidden bg-forest/5">
        <img
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2">
          <span className="inline-block bg-forest/85 text-cream/90 text-[0.62rem] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded backdrop-blur-sm">
            {product.category}
          </span>
        </div>
        {product.wholesale && (
          <div className="absolute top-2 right-2 bg-honey/90 text-forest text-[0.62rem] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded backdrop-blur-sm">
            Wholesale
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-display font-bold text-forest text-lg leading-snug">{product.title}</h3>
        <p className="mt-1 text-sm text-soil/70 line-clamp-2">{product.description}</p>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="font-display font-black text-2xl text-pine">Rp{product.price.toLocaleString()}</span>
          <span className="text-[0.7rem] font-display font-bold text-clay tracking-wide">/kg</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => console.log(`${product.title} added to cart!`)}
        className="w-full border-t border-wheat/40 bg-pine/95 text-cream font-bold py-2.5 rounded-b-2xl hover:bg-pine hover:text-cream transition-colors text-sm"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;