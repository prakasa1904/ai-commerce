import React from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { useToast } from '../../../application/providers/ToastProvider';
import { useRouter } from '@tanstack/react-router';
import { useCart } from '../../../application/hooks/useCart';
import { formatPrice } from '../../../modules/product/productUtils';
import CartLineItem from '../atoms/CartLineItem';

const CartDrawer: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({ open, onOpenChange }) => {
  const { items, total, setQuantity, remove, clear } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const handleCheckout = () => {
    toast({ title: 'Coming to the stall shortly', variant: 'default' });
    onOpenChange(false);
    void router.navigate({ to: '/cat', hash: 'products' });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Your crate"
      className="sm:max-w-md mx-4 w-full top-24 rounded-2xl border-wheat/40 bg-cream shadow-kraft-lg max-h-[80vh]"
    >
      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-soil/60">Your crate is empty — go fill it from the aisle.</p>
      ) : (
        <>
          <div className="max-h-60 overflow-y-auto">
            <ol className="divide-y divide-wheat/40">
              {items.map((item) => (
                <li key={item.product.id}>
                  <CartLineItem
                    item={item}
                    onIncrement={() => setQuantity(item.product.id, item.quantity + 1)}
                    onDecrement={() => setQuantity(item.product.id, item.quantity - 1)}
                    onRemove={() => remove(item.product.id)}
                  />
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-wheat/40 pt-3">
            <span className="text-sm font-display font-semibold text-soil">Total for the crate</span>
            <span className="text-xl font-display font-black text-pine">{formatPrice(total)}</span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={clear}>
              Clear all
            </Button>
            <Button
              type="button"
              className="flex-1 bg-pine/95 text-cream font-bold hover:bg-pine transition-colors"
              onClick={handleCheckout}
            >
              Head to the stall
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
};

export default CartDrawer;