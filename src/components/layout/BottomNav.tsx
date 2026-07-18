import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Search, Heart, User, LayoutDashboard, Package, ShoppingCart } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUI } from '../../store/useUI';
import { useAuth } from '../../store/useAuth';

export function BottomNav() {
  const { user } = useAuth();
  const accountPath = user ? (user.role === 'admin' ? '/admin/dashboard' : user.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard') : '/auth/login';
  const location = useLocation();
  const { setIsSearchOpen } = useUI();

  const isSellerRoute = location.pathname.startsWith('/seller');

  const buyerNavItems = [
    { icon: Home, label: 'Accueil', path: '/' },
    { icon: Grid, label: 'Catégories', path: '/products' },
    { icon: Search, label: 'Recherche', action: () => setIsSearchOpen(true) },
    { icon: Heart, label: 'Favoris', path: '/buyer/favorites' },
    { icon: User, label: 'Mon compte', path: accountPath },
  ];

  const sellerNavItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/seller/dashboard' },
    { icon: Package, label: 'Mes produits', path: '/seller/products' },
    { icon: ShoppingCart, label: 'Commandes', path: '/seller/orders' },
    { icon: User, label: 'Mon compte', path: accountPath },
  ];

  const navItems = isSellerRoute ? sellerNavItems : buyerNavItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border-light z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = item.path ? (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))) : false;
          
          if ('action' in item && item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-text-secondary hover:text-text-primary"
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={'path' in item ? item.path! : '#'}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'fill-current')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
