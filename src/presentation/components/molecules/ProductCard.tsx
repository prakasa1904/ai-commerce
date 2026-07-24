// Organism Component: ProductCard
// ≤30 lines: Image + Title + Actions
import React from 'react';
import type { Product } from '../../../domain/entities/Product.js';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (id: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart = () => {}
}) => (
  <article style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
    <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '16px', marginBottom: '16px' }} />
    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#e2e8f0' }}>{product.title}</h3>
    <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>{product.description}</p>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
        Rp {(product.price / 100).toFixed(2).toString()}
      </span>
      <button onClick={() => onAddToCart(product.id)} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: '#22c55e', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
        Add to Cart
      </button>
    </div>
  </article>
);

export default ProductCard;
