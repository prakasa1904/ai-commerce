import { createFileRoute, Outlet, AnyRoute } from '@tanstack/react-router';
import Header from '../presentation/components/atoms/Header';
import Footer from '../presentation/components/atoms/Footer';

const RootLayout = () => (
  <div className="min-h-screen flex flex-col bg-wheat">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export const Route = createFileRoute('/')({
  component: RootLayout,
}) as AnyRoute;
