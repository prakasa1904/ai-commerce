import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import type { Product } from '../../domain/types/product';
import { useProducts } from '../../application/hooks/useProducts';
import ProductBreadcrumb from './ProductBreadcrumb';
import ProductGallery from './ProductGallery';
import ProductMobileHeader from './ProductMobileHeader';
import ProductMeta from './ProductMeta';
import ProductInfo from './ProductInfo';
import PurchaseCard from './PurchaseCard';
import MobilePurchaseBar from './MobilePurchaseBar';
import FarmGuaranteeSection from './FarmGuaranteeSection';
import RelatedProductsSection from './RelatedProductsSection';
import { FALLBACK_IMAGE_URL } from './productUtils';

interface ProductDetailProps {
  product: Product;
}

const RELATED_LIMIT = 4;

const ProductDetail = ({ product }: ProductDetailProps) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const { data: products } = useProducts();
  const imageUrl = product.imageUrl ?? FALLBACK_IMAGE_URL;
  const total = quantity * product.price;

  const relatedProducts =
    products
      ?.filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, RELATED_LIMIT) ?? [];

  const handleAddToCart = () => {
    void router.navigate({ to: '/', replace: true });
  };

  return (
    <div className="px-4 pb-24 motion-reduce:transition-none">
      <div className="max-w-7xl mx-auto">
        <ProductBreadcrumb product={product} />

        <main className="grid lg:grid-cols-[14rem_1fr] items-start gap-8 lg:gap-12 animate-in fade-in duration-500">
          <ProductGallery imageUrl={imageUrl} title={product.title} category={product.category} />

          <section className="flex flex-col gap-7 lg:gap-12">
            <ProductMobileHeader product={product} />
            <ProductMeta product={product} />
            {/* Field note (wide) + crate card (fixed sidebar): 2 columns, 1 row in grid view */}
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-6">
              <ProductInfo product={product} />
              <PurchaseCard
                product={product}
                quantity={quantity}
                total={total}
                onQuantityChange={setQuantity}
                onAddToCart={handleAddToCart}
              />
            </div>
            <FarmGuaranteeSection />
          </section>
        </main>

        <RelatedProductsSection products={relatedProducts} category={product.category} />

        <MobilePurchaseBar total={total} onAddToCart={handleAddToCart} />
      </div>
    </div>
  );
};

export default ProductDetail;