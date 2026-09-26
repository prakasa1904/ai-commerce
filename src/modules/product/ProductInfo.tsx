import type { Product } from '../../domain/types/product';
import { unitOf } from './productUtils';

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = ({ product }: ProductInfoProps) => (
  <div className="flex flex-col gap-3 lg:pr-6">
    <p className="text-base leading-relaxed text-soil/75">{product.description}</p>
    <div className="border-t border-wheat/60" />
    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
      <div>
        <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Price
        </dt>
        <dd className="mt-1 text-2xl font-display font-black text-pine">
          Rp{product.price.toLocaleString('id-ID')}
        </dd>
      </div>
      <div>
        <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Unit
        </dt>
        <dd className="mt-1 text-sm font-display font-bold text-clay tracking-wide">
          /{unitOf(product.description)}
        </dd>
      </div>
      <div>
        <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Origin
        </dt>
        <dd className="mt-1 text-sm font-semibold text-forest">Local Farm</dd>
      </div>
    </dl>
  </div>
);

export default ProductInfo;