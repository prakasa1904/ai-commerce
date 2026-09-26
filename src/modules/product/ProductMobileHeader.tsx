import type { Product } from '../../domain/types/product';
import { categoryLabels, productRating } from './productUtils';
import RatingSeal from './RatingSeal';

interface ProductMobileHeaderProps {
  product: Product;
}

const ProductMobileHeader = ({ product }: ProductMobileHeaderProps) => {
  const imageUrl = product.imageUrl ?? 'https://dummyimage.com/800x600/1E3B2C/FBF8F1&text=Farm+Fresh';
  const { score, reviews } = productRating(product.id);

  return (
    <header className="lg:hidden grid grid-cols-[1fr_4rem] items-center gap-4">
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-card border border-wheat/60">
        <img
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <p className="font-display text-xs font-black uppercase tracking-[0.2em] text-honey">
          {categoryLabels[product.category]}
        </p>
        <h1 className="text-xl font-black leading-tight text-forest font-display">
          {product.title}
        </h1>
        <RatingSeal score={score} reviews={reviews} />
      </div>
    </header>
  );
};

export default ProductMobileHeader;