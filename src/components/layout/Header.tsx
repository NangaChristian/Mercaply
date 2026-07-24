import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Package, Heart, LogOut, LayoutDashboard, ShoppingBag, Store, Zap, ShieldCheck } from 'lucide-react';
import { useCart } from '../../store/useCart';
import { useAuth } from '../../store/useAuth';
import { useCategories } from '../../contexts/CategoriesContext';
import { supabase } from '../../lib/supabase';
import { useUI } from '../../store/useUI';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { items, setIsCartOpen } = useCart();
  const { setIsSearchOpen } = useUI();
  const { user, setUser, setSupabaseUser } = useAuth();
  const { productCategories } = useCategories();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSupabaseUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMegaMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const isSeller = user?.role === 'seller';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-lg border-b border-zinc-200/50 shadow-sm' : 'bg-white border-b border-transparent'}`}>
        {/* Top Info Bar */}
        <div className="bg-zinc-950 text-zinc-300 text-xs py-1.5 hidden md:block">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Paiements sécurisés</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> Livraison express</span>
            </div>
            <div className="flex gap-4">
              <Link to="/about" className="hover:text-white transition-colors">À propos</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4 md:gap-8">
            
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="text-2xl font-bold tracking-tighter text-zinc-950">
                Mercaply<span className="text-accent">.</span>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center gap-1">
                <button 
                  onMouseEnter={() => setIsMegaMenuOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 rounded-md transition-colors"
                >
                  Catalogue <ChevronDown className={`w-4 h-4 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <Link to="/vendors" className="px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 rounded-md transition-colors">Vendeurs</Link>
                <Link to="/services" className="px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 rounded-md transition-colors">Services</Link>
              </nav>
            </div>

            {/* Global Search (Trigger) */}
            <div className="flex-1 max-w-xl hidden md:block">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center gap-2 px-4 py-2 bg-zinc-100/50 hover:bg-zinc-100 border border-zinc-200/50 rounded-full text-zinc-500 text-sm transition-colors group"
              >
                <Search className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                <span>Rechercher des produits, services...</span>
                <div className="ml-auto flex gap-1">
                  <kbd className="hidden lg:inline-flex items-center justify-center rounded border border-zinc-300 bg-white px-1.5 font-mono text-[10px] font-medium text-zinc-500">⌘</kbd>
                  <kbd className="hidden lg:inline-flex items-center justify-center rounded border border-zinc-300 bg-white px-1.5 font-mono text-[10px] font-medium text-zinc-500">K</kbd>
                </div>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              <div className="relative">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-2 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors focus:outline-none"
                >
                  {user ? (
                    <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center text-xs font-bold border border-zinc-200">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden"
                    >
                      {user ? (
                        <>
                          <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                            <p className="text-sm font-medium text-zinc-900 truncate">Connecté</p>
                            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                          </div>
                          <div className="p-2">
                            {isSeller ? (
                              <>
                                <Link to="/seller/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"><LayoutDashboard className="w-4 h-4" /> Dashboard Vendeur</Link>
                                <Link to="/seller/products" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"><Package className="w-4 h-4" /> Mes Produits</Link>
                                <Link to="/seller/store" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"><Store className="w-4 h-4" /> Ma Boutique</Link>
                              </>
                            ) : (
                              <>
                                <Link to="/buyer/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"><LayoutDashboard className="w-4 h-4" /> Mon Espace</Link>
                                <Link to="/buyer/orders" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"><ShoppingBag className="w-4 h-4" /> Mes Commandes</Link>
                                <Link to="/buyer/favorites" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"><Heart className="w-4 h-4" /> Mes Favoris</Link>
                              </>
                            )}
                          </div>
                          <div className="p-2 border-t border-zinc-100">
                            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"><LogOut className="w-4 h-4" /> Déconnexion</button>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 flex flex-col gap-3">
                          <Link to="/auth/login" className="w-full text-center bg-zinc-950 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">Connexion</Link>
                          <Link to="/auth/register" className="w-full text-center bg-white border border-zinc-200 text-zinc-950 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">Créer un compte</Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute 2 top-0 right-0 h-4 w-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu Overlay */}
        <AnimatePresence>
          {isMegaMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 top-[104px] bg-black/20 backdrop-blur-sm z-40"
                onMouseEnter={() => setIsMegaMenuOpen(false)}
              />
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 bg-white border-b border-zinc-200 shadow-xl z-50 origin-top"
                onMouseLeave={() => setIsMegaMenuOpen(false)}
              >
                <div className="container mx-auto px-4 py-8">
                  <div className="grid grid-cols-4 gap-8">
                    <div>
                      <h3 className="font-semibold text-zinc-950 mb-4 flex items-center gap-2">🛒 Parcourir</h3>
                      <ul className="space-y-3">
                        <li><Link to="/products" className="text-sm text-zinc-500 hover:text-accent transition-colors">Tous les produits</Link></li>
                        <li><Link to="/services" className="text-sm text-zinc-500 hover:text-accent transition-colors">Tous les services</Link></li>
                        <li><Link to="/vendors" className="text-sm text-zinc-500 hover:text-accent transition-colors">Annuaire des vendeurs</Link></li>
                      </ul>
                    </div>
                    <div className="col-span-3 grid grid-cols-3 gap-8">
                      {productCategories?.slice(0, 6).map(cat => (
                        <div key={cat.id}>
                          <Link to={`/products?category=${cat.slug}`} className="font-medium text-zinc-900 mb-2 flex items-center gap-2 hover:text-accent transition-colors">
                            <span>{cat.icon_name}</span> {cat.name}
                          </Link>
                          {/* Subcategories could go here */}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
      {/* Spacer to prevent content jump */}
      <div className="h-[104px] md:h-[90px]"></div>
    </>
  );
}
