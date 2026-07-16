import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { CartDrawer } from '../cart/CartDrawer';
import { SearchModal } from './SearchModal';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <main className="flex-1 w-full pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <CartDrawer />
      <SearchModal />
    </div>
  );
}
