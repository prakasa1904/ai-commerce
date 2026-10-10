import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ShoppingBasket, Store } from 'lucide-react';
import BrandWordmark from './BrandWordmark';
import CartDrawer from '../molecules/CartDrawer';
import HeaderMobileMenu from '../molecules/HeaderMobileMenu';
import { useCart } from '../../../application/hooks/useCart';
import { useAuthContext } from '../../../application/providers/AuthProvider';

const Header: React.FC = () => {
  const { user, isAdmin, logout } = useAuthContext();
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-forest/95 backdrop-blur border-b border-forest/60">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <BrandWordmark />
        <div className="flex items-center gap-3">
          <div className="sm:hidden">
            <HeaderMobileMenu onCartOpenChange={setCartOpen} />
          </div>
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link to="/cat" className="text-cream/85 hover:text-cream transition-colors">Shop</Link>
            {user && (
              <>
                <Link to="/admin/users" className="flex items-center gap-1.5 text-cream/85 hover:text-cream transition-colors">
                  <Store className="h-3.5 w-3.5" />
                  Admin
                </Link>
                {isAdmin && <span className="rounded-full bg-honey/20 text-honey text-[0.6rem] font-black uppercase tracking-[0.2em] px-2.5 py-0.5">Admin</span>}
                <button type="button" onClick={logout} className="text-cream/85 hover:text-cream/100 transition-colors">Sign out</button>
              </>
            )}
            {!user && (
              <Link to="/login" className="ml-auto text-cream/85 hover:text-cream transition-colors">Sign in</Link>
            )}
          </nav>
        </div>
        <button
          type="button"
          aria-label={count === 0 ? 'Cart' : `Cart with ${count} items`}
          onClick={() => setCartOpen(true)}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center text-cream/80 transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-honey focus-visible:outline-offset-2"
        >
          <ShoppingBasket className="h-4.5 w-4.5" aria-hidden="true" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1.5 rounded-full bg-honey px-1.5 py-0.5 text-[0.62rem] font-black text-forest">
              {count}
            </span>
          )}
        </button>
      </div>
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
};

export default Header;