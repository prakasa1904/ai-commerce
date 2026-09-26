import { Link } from '@tanstack/react-router';
import type { Product } from '../../domain/types/product';
import { categoryLabels } from './productUtils';

const crumbColor = 'text-muted-foreground/80 hover:text-soil';

interface ProductBreadcrumbProps {
  product: Product;
}

const ProductBreadcrumb = ({ product }: ProductBreadcrumbProps) => (
  <nav aria-label="Breadcrumb" className="py-10 text-sm animate-in fade-in duration-500">
    <ol className="flex flex-wrap items-center gap-1 max-w-5xl">
      <li>
        <Link to="/" className={`flex items-center gap-1.5 transition-colors ${crumbColor}`}>
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
);

export default ProductBreadcrumb;