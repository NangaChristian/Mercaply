import { supabase } from '../../lib/supabase';
// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  ShoppingCart, 
  MessageSquare, 
  Store, 
  BarChart3, 
  Wallet, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../store/useAuth';
import { useProducts } from '../../hooks/useProducts';
import { cn } from '../../utils/cn';
import { BottomNav } from './BottomNav';

import { LanguageSwitcher } from "../LanguageSwitcher";

const navigation = [
  { name: "Vue d'ensemble", href: '/seller/dashboard', icon: LayoutDashboard },
  { name: 'Mes produits', href: '/seller/products', icon: Package },
  { name: 'Ajouter un produit', href: '/seller/products/new', icon: PlusCircle },
  { name: 'Mes services', href: '/seller/services', icon: Briefcase },
  { name: 'Ajouter un service', href: '/seller/services/new', icon: PlusCircle },
  { name: 'Commandes reçues', href: '/seller/orders', icon: ShoppingCart },
  { name: 'Messages clients', href: '/seller/messages', icon: MessageSquare },
  { name: 'Ma boutique', href: '/seller/store', icon: Store },
  { name: 'Statistiques', href: '/seller/stats', icon: BarChart3 },
  { name: 'Finances', href: '/seller/finances', icon: Wallet },
  { name: 'Paramètres', href: '/seller/settings', icon: Settings },
];

export function SellerLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products } = useProducts({});
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const lowStockProducts = products.filter(p => p.stock < 10);
  const totalNotifications = lowStockProducts.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate('/');
  };

  const storeName = "Ma Boutique";
  const isVerified = false;

  return (
    <div className="min-h-screen bg-surface-2 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border-light transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex lg:flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-light">
          <Link to="/" className="flex items-center">
            <img src="/Mercaply black-01.png" alt="Mercaply" className="h-8 object-contain" />
            <span className="text-xs font-bold text-accent ml-2 tracking-widest mt-1">SELLER</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 border-b border-border-light">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-surface border border-border-light flex items-center justify-center overflow-hidden">
              <Store className="h-6 w-6 text-text-tertiary" />
            </div>
            <div>
              <h2 className="font-bold text-text-primary text-sm flex items-center">
                {storeName}
                {isVerified && <CheckCircle2 className="h-4 w-4 text-success ml-1" />}
              </h2>
              <p className="text-xs text-text-secondary">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/seller/dashboard' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors",
                  isActive 
                    ? "bg-accent/10 text-accent" 
                    : "text-text-secondary hover:bg-surface hover:text-text-primary"
                )}
              >
                <item.icon className={cn("h-5 w-5 mr-3", isActive ? "text-accent" : "text-text-tertiary")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-light flex flex-col gap-4">
          <LanguageSwitcher />
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-danger rounded-xl hover:bg-danger/10 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-background border-b border-border-light flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 mr-2 text-text-secondary hover:bg-surface rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-text-primary hidden sm:block">
              {navigation.find(n => location.pathname === n.href || (n.href !== '/seller/dashboard' && location.pathname.startsWith(n.href)))?.name || 'Espace Vendeur'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/" className="text-sm font-medium text-accent hover:underline hidden sm:block">
              Voir ma boutique publique
            </Link>
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-text-secondary hover:bg-surface rounded-full transition-colors"
              >
                <Bell className="h-5 w-5" />
                {totalNotifications > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-danger rounded-full ring-2 ring-background" />
                )}
              </button>
              
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-background border border-border-light shadow-lg rounded-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-border-light flex justify-between items-center">
                    <h3 className="font-bold text-text-primary">Notifications</h3>
                    <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">{totalNotifications} nouvelle{totalNotifications > 1 ? 's' : ''}</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {totalNotifications === 0 ? (
                      <div className="p-6 text-center text-text-secondary text-sm">
                        Aucune nouvelle notification
                      </div>
                    ) : (
                      <div className="p-2">
                        {lowStockProducts.map(product => (
                          <Link 
                            key={product.id}
                            to={`/seller/products?search=${encodeURIComponent(product.title)}`}
                            onClick={() => setIsNotificationsOpen(false)}
                            className="flex items-start p-3 hover:bg-surface rounded-xl transition-colors"
                          >
                            <div className="p-2 bg-warning-dark/10 rounded-full mr-3 text-warning-dark flex-shrink-0 mt-0.5">
                              <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary line-clamp-1">{product.title}</p>
                              <p className="text-xs text-text-secondary mt-0.5">
                                Stock bas : <span className="font-bold text-danger">{product.stock} restants</span>
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Add BottomNav on mobile for consistency */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
