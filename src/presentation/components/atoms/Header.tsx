import React from 'react';
import { Link } from '@tanstack/react-router';
import BrandWordmark from './BrandWordmark';
import { useAuthContext } from '../../../application/providers/AuthProvider';
import { Store } from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAdmin, logout } = useAuthContext();

  return (
    <header className="sticky top-0 z-50 bg-forest/95 backdrop-blur border-b border-forest/60">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <BrandWordmark />
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
    </header>
  );
};

export default Header;