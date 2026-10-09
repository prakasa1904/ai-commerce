import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import Header from '../presentation/components/atoms/Header';
import Footer from '../presentation/components/atoms/Footer';

const RootLayout = () => {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  return (
    <div className="min-h-screen flex flex-col bg-wheat">
      {!isAdmin && <Header />}
      <main className={isAdmin ? 'flex-1 bg-wheat' : 'flex-1'}>
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

export const Route = createRootRoute({
  component: RootLayout,
});