const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174';

export async function fetchProducts() {
  const res = await fetch(`${BASE_URL}/api/products`);
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  const data = await res.json();
  return data.products || data;
}

export async function fetchProduct(id: number) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`);
  if (!res.ok) return null;
  return res.json();
}