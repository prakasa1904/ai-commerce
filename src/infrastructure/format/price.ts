export const formatPrice = (amount: number): string =>
  `Rp${amount.toLocaleString('id-ID')}`;

export const unitOf = (description: string): string => {
  const match = description.match(/((\d+\s*(kg|g|L|pcs|tray)))\s*$/i);
  return match ? match[1] : 'unit';
};