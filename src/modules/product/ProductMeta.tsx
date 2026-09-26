import type { Product } from '../../domain/types/product';
import { categoryLabels, productRating } from './productUtils';
import RatingSeal from './RatingSeal';
import categoryMarks from '../../presentation/components/atoms/CategoryMark';

interface ProductMetaProps {
  product: Product;
}

const ProductMeta = ({ product }: ProductMetaProps) => {
  const { score, reviews } = productRating(product.id);
  const Mark = categoryMarks[product.category];

  return (
    <div className="hidden lg:flex flex-col gap-7">
      <div className="flex flex-wrap items-center gap-3 gap-y-4">
        <RatingSeal score={score} reviews={reviews} />
        {product.wholesale && (
          <span className="inline-flex items-center gap-1 bg-clay/15 text-clay font-display font-black text-[0.68rem] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full">
            Wholesale lot
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 text-[0.75rem] font-display font-black uppercase tracking-[0.12em] text-soil/60">
          Harvested today
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-full bg-wheat shadow-sm flex h-9 w-9 items-center justify-center text-forest">
          <Mark className="h-5 w-5" aria-label={categoryLabels[product.category]} />
        </span>
        <span className="font-display font-black text-[0.68rem] uppercase tracking-[0.25em] text-honey">
          {categoryLabels[product.category]}
        </span>
      </div>

      <h1 className="font-display font-black text-3xl lg:text-5xl leading-[1.05] tracking-tight text-forest">
        {product.title}
      </h1>
    </div>
  );
};

export default ProductMeta;