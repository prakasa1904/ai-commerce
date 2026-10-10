import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, Store, ShoppingBasket, X } from 'lucide-react';
import { Drawer } from '../ui/drawer';
import { useAuthContext } from '../../../application/providers/AuthProvider';
import { useCart } from '../../../application/hooks/useCart';

interface HeaderMobileMenuProps {
  onCartOpenChange: (open: boolean) => void;
}

const HeaderMobileMenu: React.FC<HeaderMobileMenuProps> = ({ onCartOpenChange }) => {
  const { user, isAdmin, logout } = useAuthContext();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center text-cream/80 transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-honey focus-visible:outline-offset-2"
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>
      <Drawer open={open} onOpenChange={setOpen} title="Menu" side="right">
        <nav id="mobile-menu" aria-label="Mobile" className="flex flex-col text-sm">
          <Link
            to="/cat"
            onClick={close}
            className="py-2 text-forest/85 hover:text-forest transition-colors"
          >
            Shop
          </Link>
          {user && (
            <>
              <div className="mt-1 flex items-center gap-1.5">
                <Link
                  to="/admin/users"
                  onClick={close}
                  className="flex items-center gap-1.5 py-2 text-forest/85 hover:text-forest transition-colors"
                >
                  <Store className="h-3.5 w-3.5" />
                  Admin
                </Link>
                {isAdmin && (
                  <span className="rounded-full bg-honey/20 px-2.5 py-0.5 text-[0.6rem] font-black uppercase tracking-[0.2em] text-honey">
                    Admin
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  close();
                }}
                className="justify-self-start py-2 text-left text-forest/85 hover:text-forest transition-colors"
              >
                Sign out
              </button>
            </>
          )}
          {!user && (
            <Link
              to="/login"
              onClick={close}
              className="mt-1 py-2 text-forest/85 hover:text-forest transition-colors"
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onCartOpenChange(true);
            }}
            aria-label={count === 0 ? 'Your crate' : `Your crate with ${count} items`}
            className="mt-2 flex items-center justify-between rounded-lg border border-wheat/40 bg-card px-3 py-2.5 shadow-kraft transition-colors hover:bg-wheat/60"
          >
            <span className="flex items-center gap-2 text-forest">
              <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
              Your crate
            </span>
            {count > 0 && (
              <span className="rounded-full bg-honey px-1.5 py-0.5 text-[0.62rem] font-black text-forest tabular-nums">
                {count}
              </span>
            )}
          </button>
        </nav>
      </Drawer>
    </>
  );
};

export default HeaderMobileMenu;