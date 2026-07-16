import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { useUserRole } from '../../hooks/useUserRole';
import { supabase } from '../../lib/supabase';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  ShoppingBag, 
  ShoppingCart, 
  Settings, 
  LogOut,
  ShieldCheck,
  Menu,
  X,
  TrendingUp,
  Activity,
  Briefcase
, Image, List } from 'lucide-react';
import { useState, useEffect } from 'react';

import { LanguageSwitcher } from "../LanguageSwitcher";

const navigation = [
  { name: 'Tableau de bord', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Rapports', href: '/admin/reports', icon: TrendingUp },
  { name: 'Utilisateurs', href: '/admin/users', icon: Users },
  { name: 'Boutiques', href: '/admin/stores', icon: Store },
  { name: 'Produits', href: '/admin/products', icon: ShoppingBag },
  { name: 'Services', href: '/admin/services', icon: Briefcase },
  { name: 'Commandes', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Journaux', href: '/admin/logs', icon: Activity },
  { name: 'Contenu Accueil', href: '/admin/content', icon: Image },
  { name: 'Catégories', href: '/admin/categories', icon: List },
  { name: 'Paramètres', href: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!supabase) {
        navigate('/admin/login');
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !isAdmin) {
        // Redirection logic is mainly handled by ProtectedAdminRoute now
      } else {
        setAdminEmail(session.user.email ?? null);
      }
    };
    checkAdmin();
  }, [navigate, isAdmin]);

  if (!isAdmin) return null;

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-surface border-r border-border-light
        transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-accent" />
            <span className="text-xl font-bold text-text-primary">Administration</span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isActive 
                    ? 'bg-accent text-white shadow-md shadow-accent/20' 
                    : 'text-text-secondary hover:bg-background hover:text-text-primary'
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-text-secondary'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-light">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <span className="text-accent font-semibold">AD</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-text-primary truncate">{adminEmail}</p>
              <p className="text-xs text-text-secondary">Administrateur</p>
            </div>
          </div>
          <div className="mt-4 px-2">
            <LanguageSwitcher />
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-surface border-b border-border-light p-4 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-accent" />
            <span className="text-xl font-bold text-text-primary">Administration</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-text-secondary hover:text-text-primary"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
