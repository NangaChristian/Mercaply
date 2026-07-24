import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { useUserRole } from '../../hooks/useUserRole';
import { supabase } from '../../lib/supabase';
import { 
  LayoutDashboard, Users, Building2, ShieldCheck, Box, Briefcase, 
  ShoppingCart, CreditCard, Wallet, ArrowRightLeft, MessageSquare, 
  Bell, AlertTriangle, Star, LayoutTemplate, Layers, Megaphone, 
  BarChart, FileText, Activity, ShieldAlert, Settings, Key, 
  Database, LogOut, ChevronDown, ChevronRight, Menu, X, Search
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Massive Enterprise Navigation
const navigationSections = [
  {
    title: 'Vue Globale',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Utilisateurs & Entités',
    items: [
      { name: 'Utilisateurs', href: '/admin/users', icon: Users },
      { name: 'Entreprises', href: '/admin/stores', icon: Building2 },
      { name: 'Validation KYC', href: '/admin/kyc', icon: ShieldCheck }
    ]
  },
  {
    title: 'Catalogue & Ventes',
    items: [
      { name: 'Produits', href: '/admin/products', icon: Box },
      { name: 'Services', href: '/admin/services', icon: Briefcase },
      { name: 'Commandes', href: '/admin/orders', icon: ShoppingCart }
    ]
  },
  {
    title: 'Finances',
    items: [
      { name: 'Transactions', href: '/admin/transactions', icon: ArrowRightLeft },
      { name: 'Paiements', href: '/admin/payments', icon: CreditCard },
      { name: 'Retraits (Payouts)', href: '/admin/withdrawals', icon: Wallet }
    ]
  },
  {
    title: 'Modération & Support',
    items: [
      { name: 'Signalements', href: '/admin/reports', icon: AlertTriangle },
      { name: 'Avis & Critiques', href: '/admin/reviews', icon: Star },
      { name: 'Messagerie', href: '/admin/messages', icon: MessageSquare }
    ]
  },
  {
    title: 'CMS & Marketing',
    items: [
      { name: 'Contenu Pages', href: '/admin/content', icon: LayoutTemplate },
      { name: 'Catégories', href: '/admin/categories', icon: Layers },
      { name: 'Publicités', href: '/admin/ads', icon: Megaphone }
    ]
  },
  {
    title: 'Analytics',
    items: [
      { name: 'Statistiques', href: '/admin/analytics', icon: BarChart },
      { name: 'Rapports Exports', href: '/admin/reports-export', icon: FileText }
    ]
  },
  {
    title: 'Système & Sécurité',
    items: [
      { name: 'Sécurité & Audit', href: '/admin/security', icon: ShieldAlert },
      { name: 'Configuration', href: '/admin/settings', icon: Settings },
      { name: 'API & Intégrations', href: '/admin/api', icon: Key },
      { name: 'Logs Système', href: '/admin/logs', icon: Activity }
    ]
  }
];

export function AdminLayout() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    navigationSections.reduce((acc, section) => ({ ...acc, [section.title]: true }), {})
  );

  useEffect(() => {
    const checkAdmin = async () => {
      if (!supabase) {
        navigate('/admin/login');
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !isAdmin) {
        // Handled by ProtectedAdminRoute
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

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex selection:bg-zinc-900 selection:text-white">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Enterprise Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-[#0F172A] text-slate-300
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col shadow-2xl lg:shadow-none
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 bg-[#0B1120] border-b border-slate-800">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-inner">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Mercaply<span className="text-accent text-sm align-top">ERP</span></span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 bg-[#0F172A] border-b border-slate-800/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-bold text-sm">SA</span>
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-white truncate">{adminEmail}</p>
              <p className="text-xs text-accent-light font-medium">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          {navigationSections.map((section) => (
            <div key={section.title} className="mb-6">
              <button 
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
              >
                {section.title}
                {expandedSections[section.title] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
              
              <AnimatePresence>
                {expandedSections[section.title] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
                      const Icon = item.icon;
                      
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                            ${isActive 
                               ? 'bg-accent/10 text-accent-light border border-accent/20 shadow-inner' 
                               : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                            }
                          `}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className={`h-4 w-4 ${isActive ? 'text-accent-light' : 'text-slate-500'}`} />
                          {item.name}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 bg-[#0B1120] border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion Sécurisée
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Enterprise Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Global Command Menu Trigger */}
            <button className="hidden md:flex items-center gap-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2 rounded-lg text-slate-500 transition-colors w-96">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm">Rechercher commandes, utilisateurs...</span>
              <div className="ml-auto flex gap-1">
                <kbd className="bg-white border border-slate-300 rounded px-1.5 text-[10px] font-mono text-slate-500 shadow-sm">⌘</kbd>
                <kbd className="bg-white border border-slate-300 rounded px-1.5 text-[10px] font-mono text-slate-500 shadow-sm">K</kbd>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <MessageSquare className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <Outlet />
        </main>
      </div>
      
      {/* Global CSS overrides for the custom scrollbar in admin */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}
