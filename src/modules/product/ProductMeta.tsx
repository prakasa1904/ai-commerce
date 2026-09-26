import { CalendarHeart } from 'lucide-react';
import type { Product } from '../../domain/types/product';
import { Badge } from '../../presentation/components/ui/badge';
import { categoryLabels, productRating } from './productUtils';
import RatingSeal from './RatingSeal';

interface ProductMetaProps {
  product: Product;
}

const ProductMeta = ({ product }: ProductMetaProps) => {
  const { score, reviews } = productRating(product.id);

  return (
    <div className="hidden lg:flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <RatingSeal score={score} reviews={reviews} />
        {product.wholesale && (
          <Badge className="bg-honey/90 text-forest">
            Wholesale <CalendarHeart className="h-3.5 w-3.5" />
          </Badge>
        )}
        <span className="inline-flex items-center gap-1.5 text-xs font-display font-black uppercase tracking-wide text-moss">
          <CalendarHeart className="h-3.5 w-3.5" />
          Harvested today
        </span>
      </div>
      <p className="font-display text-xs font-black uppercase tracking-[0.25em] text-honey">
        {categoryLabels[product.category]}
      </p>
      <h1 className="font-display font-black text-3xl lg:text-5xl leading-[1.05] tracking-tight text-forest">
        {product.title}
      </h1>
    </div>
  );
};

export default ProductMeta;