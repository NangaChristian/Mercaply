// @ts-nocheck
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Heart, 
  MessageSquare, 
  MapPin, 
  User, 
  Bell, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../store/useAuth';
import { cn } from '../../utils/cn';
import { BottomNav } from './BottomNav';
import { SearchModal } from './SearchModal';

import { LanguageSwitcher } from '../LanguageSwitcher';

import { supabase } from '../../lib/supabase';

const navItems = [
  { name: 'Tableau de bord', path: '/buyer/dashboard', icon: LayoutDashboard },
  { name: 'Mes commandes', path: '/buyer/orders', icon: ShoppingBag },
  { name: 'Mes favoris', path: '/buyer/favorites', icon: Heart },
  { name: 'Messages', path: '/buyer/messages', icon: MessageSquare },
  { name: 'Mes adresses', path: '/buyer/addresses', icon: MapPin },
  { name: 'Mon profil', path: '/buyer/profile', icon: User },
  { name: 'Notifications', path: '/buyer/notifications', icon: Bell },
];

export function BuyerLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background border-r border-border-light">
      {/* User Info */}
      <div className="p-6 border-b border-border-light flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent text-2xl font-bold mb-3">
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h2 className="font-bold text-text-primary truncate w-full">{user?.email}</h2>
        <span className="mt-1 px-2.5 py-0.5 bg-surface rounded-full text-xs font-medium text-text-secondary capitalize">
          {user?.role === 'buyer' ? 'Acheteur' : user?.role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setIsMobileSidebarOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              isActive 
                ? "bg-accent/10 text-accent" 
                : "text-text-secondary hover:bg-surface hover:text-text-primary"
            )}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border-light flex flex-col gap-4">
        <LanguageSwitcher />
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-2 flex flex-col md:flex-row">
      {/* Mobile Header for Sidebar Toggle */}
      <div className="md:hidden bg-background border-b border-border-light p-4 flex items-center justify-between sticky top-0 z-30">
        <h1 className="font-bold text-lg text-text-primary">Espace Acheteur</h1>
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 text-text-secondary hover:bg-surface rounded-lg"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-background shadow-xl animate-in slide-in-from-left duration-300">
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 text-text-secondary hover:bg-surface rounded-full z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
        <Outlet />
      </main>
      
      {/* Add BottomNav on mobile for consistency */}
      <div className="md:hidden">
        <BottomNav />
      </div>
      
      <SearchModal />
    </div>
  );
}
