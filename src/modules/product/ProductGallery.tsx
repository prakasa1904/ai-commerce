import type { ProductCategory } from '../../domain/types/product';
import categoryMarks from '../../presentation/components/atoms/CategoryMark';
import { Leaf } from 'lucide-react';

interface ProductGalleryProps {
  imageUrl: string;
  title: string;
  category: ProductCategory;
}

const ProductGallery = ({ imageUrl, title, category }: ProductGalleryProps) => {
  const Mark = categoryMarks[category];

  return (
    <figure className="hidden lg:block">
      {/* Frame: a stall-shelf plank under the photo */}
      <div
        aria-hidden="true"
        className="mb-5 h-3 w-72 rotate-1 rounded-sm bg-pine shadow-md"
      />
      <div className="relative">
        <div className="absolute -inset-5 -z-0 rounded-2xl bg-kraft bg-[radial-gradient(600px_300px_at_70%_0%,rgba(74,54,40,0.05),transparent_60%)] rotate-0.5 shadow-xl" />
        <div className="relative overflow-hidden rounded-2xl border border-wheat-800/40 bg-card shadow-xl group">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(500px_300px_at_100%_0%,rgba(31,59,44,0.12),transparent_60%)]"
          />
          <div className="aspect-[4/5] w-full bg-forest/5">
            <img
              src={imageUrl}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          </div>

          {/* Kraft caption plate pinned to the bottom */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -top-1 -left-2 h-5 w-5 bg-honey/80 blur-sm"
              />
              <span className="inline-block bg-kraft text-forest font-display font-[800] text-[11px] tracking-[0.22em] uppercase leading-none px-3.5 py-2.5 shadow-md">
                {title}
              </span>
            </div>
          </div>

          {/* Category mark tag, top-left */}
          <span
            aria-hidden="true"
            className="absolute -top-3.5 -left-3.5 translate-y-px"
          >
            <Mark className="h-7 w-7 text-forest" />
          </span>

          {/* Wax seal, bottom-right, overlapping the plate */}
          <span
            className="absolute -bottom-3.5 right-3.5 z-10"
            aria-label="Farm Marketplace wax seal"
          >
            <span
              aria-hidden="true"
              className="z-10 block h-10 w-10 rotate-6 bg-honey shadow-lg"
            />
            <span className="absolute inset-0 z-20 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-forest/85" aria-hidden="true" />
            </span>
          </span>
        </div>
      </div>
    </figure>
  );
};

export default ProductGallery;