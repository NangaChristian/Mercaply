// @ts-nocheck
import { useCategories } from '../../contexts/CategoriesContext';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, Heart, User, ShoppingCart, Menu, Store, X, LayoutDashboard, Package, LogOut, ChevronRight,
  PlusCircle, MessageSquare, BarChart3, Wallet, Settings, ShoppingBag, MapPin, Bell
} from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useAuth } from '../../store/useAuth';
import { useUserRole } from '../../hooks/useUserRole';
import { useCart } from '../../store/useCart';
import { useUI } from '../../store/useUI';
import { useMessages } from '../../hooks/useMessages';

import { useRef } from 'react';

import { cn } from '../../utils/cn';


export function Header() {
  const { productCategories: PRODUCT_CATEGORIES, serviceCategories: SERVICE_CATEGORIES } = useCategories();

  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user } = useAuth();
  const { isAdmin, isSeller } = useUserRole();
  const { getCartCount, setIsCartOpen } = useCart();
  const { conversations } = useMessages();
  const unreadMessagesCount = conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  const { setIsSearchOpen } = useUI();
  const navigate = useNavigate();

  const [inlineQuery, setInlineQuery] = useState('');
  const [inlineResults, setInlineResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!inlineQuery.trim()) {
        setInlineResults([]);
        return;
      }
      setIsSearching(true);
      try {
        let items: any[] = [];
        const term = inlineQuery.trim().toLowerCase();
        
        // Since firestore doesn't do ilike natively well, we'll fetch some products and filter locally for a quick inline search
        const productsSnap = await getDocs(query(collection(db, 'products'), limit(50)));
        const servicesSnap = await getDocs(query(collection(db, 'services'), limit(50)));
        
        const allProducts = productsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any), type: 'product' }));
        const allServices = servicesSnap.docs.map(d => ({ id: d.id, ...(d.data() as any), type: 'service' }));
        
        const combined = [...allProducts, ...allServices];
        const filtered = combined.filter(item => 
          item.title?.toLowerCase().includes(term) || 
          item.category?.toLowerCase().includes(term)
        ).slice(0, 5);
        
        setInlineResults(filtered);
      } catch (err) {
        console.error('Error in inline search:', err);
      } finally {
        setIsSearching(false);
      }
    };
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [inlineQuery]);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-sm py-3" : "bg-transparent py-5"
      )}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Category Button */}
          <div className="flex items-center space-x-6 lg:space-x-12">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/Mercaply black-01.png" alt="Mercaply" className="h-8 object-contain" />
            </Link>

            <div className="hidden lg:block relative group">
              <button className="flex items-center space-x-2 px-5 py-2.5 bg-accent/10 text-accent rounded-full font-bold text-sm hover:bg-accent/20 transition-colors">
                <Menu className="h-4 w-4" />
                <span>Parcourir les catégories</span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-[280px] bg-white rounded-xl shadow-xl border border-border-light py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                 {PRODUCT_CATEGORIES.map((category) => (
                    <Link 
                       key={category.id} 
                       to={`/products?category=${category.id}`}
                       className="flex items-center px-5 py-3 hover:bg-surface text-text-secondary hover:text-accent font-medium text-sm transition-colors"
                    >
                       <span className="mr-3 text-text-tertiary">{category.icon && <Menu className="w-4 h-4 opacity-50" />}</span>
                       {category.name}
                    </Link>
                 ))}
                 <div className="px-5 py-3 border-t border-border mt-2">
                    <Link to="/products" className="text-accent text-sm font-bold flex items-center">
                       Voir tous les produits <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                 </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-sm font-bold text-text-primary hover:text-accent transition-colors">{t('home')}</Link>
            <Link to="/products" className="text-sm font-bold text-text-secondary hover:text-accent transition-colors">Boutique</Link>
            <Link to="/services" className="text-sm font-bold text-text-secondary hover:text-accent transition-colors">{t('services')}</Link>
            <Link to="/products" className="text-sm font-bold text-text-secondary hover:text-accent transition-colors">Nouveautés</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-5">
            <LanguageSwitcher />
            <div ref={searchRef} className="hidden lg:block relative">
              <div 
                className={cn(
                  "flex items-center bg-surface border border-border-light rounded-full transition-all duration-300 overflow-hidden",
                  isSearchExpanded ? "px-3 py-1.5 w-64 xl:w-80 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent" : "w-10 h-10 justify-center cursor-pointer hover:border-text-primary"
                )}
                onClick={() => {
                  if (!isSearchExpanded) {
                    setIsSearchExpanded(true);
                  }
                }}
              >
                <Search className={cn("h-4 w-4 shrink-0", isSearchExpanded ? "text-text-tertiary mr-2" : "text-text-primary")} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={inlineQuery}
                  onChange={(e) => {
                    setInlineQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => {
                    if (!inlineQuery) {
                      setIsSearchExpanded(false);
                      setShowDropdown(false);
                    }
                  }}
                  className={cn(
                    "bg-transparent border-none outline-none text-sm transition-all duration-300",
                    isSearchExpanded ? "w-full opacity-100" : "w-0 opacity-0"
                  )}
                />
              </div>
              
              {showDropdown && inlineQuery.trim() !== '' && (
                <div className="absolute top-full mt-2 w-full max-w-sm right-0 bg-background border border-border-light rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="p-2 max-h-80 overflow-y-auto">
                    {isSearching ? (
                      <div className="text-center py-4 text-sm text-text-secondary">Recherche...</div>
                    ) : inlineResults.length > 0 ? (
                      inlineResults.map(res => (
                        <div 
                          key={res.id} 
                          className="flex items-center gap-3 p-2 hover:bg-surface rounded-lg cursor-pointer transition-colors"
                          onClick={() => {
                            setShowDropdown(false);
                            setInlineQuery('');
                            navigate(`/${res.type === 'product' ? 'product' : 'service'}/${res.id}`);
                          }}
                        >
                          <img src={res.images?.[0] || 'https://via.placeholder.com/40'} alt={res.title} className="w-10 h-10 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold truncate text-text-primary">{res.title}</h4>
                            <p className="text-[10px] text-text-secondary truncate">{res.category}</p>
                          </div>
                          <span className="text-xs font-bold text-accent">{(res.price || 0).toLocaleString()} CFA</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-sm text-text-secondary">Aucun résultat</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 border border-border-light rounded-full text-text-primary hover:border-text-primary transition-colors lg:hidden flex items-center justify-center"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link to="/buyer/favorites" className="p-2 border border-border-light rounded-full text-text-primary hover:border-text-primary transition-colors hidden sm:flex items-center justify-center">
              <Heart className="h-4 w-4" />
            </Link>
            
            <div className="hidden sm:flex items-center space-x-3 group relative cursor-pointer pt-2 pb-2">
              <div className="p-2 border border-border-light rounded-full text-text-primary group-hover:border-text-primary transition-colors flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                {user ? (
                   <>
                    <span className="text-[10px] text-text-secondary leading-none mb-1">Bonjour, {user.email?.split('@')[0] || 'User'}</span>
                    <span className="text-xs font-bold leading-none capitalize">{user.role}</span>
                   </>
                ) : (
                  <>
                    <span className="text-[10px] text-text-secondary leading-none mb-1">Bonjour,</span>
                    <Link to="/auth/login" className="text-xs font-bold leading-none hover:text-accent transition-colors">Connexion / Inscription</Link>
                  </>
                )}
              </div>

               {/* Dropdown for User */}
               {user && (
                 <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-border-light opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden flex flex-col max-h-[80vh] overflow-y-auto custom-scrollbar">
                   {isAdmin ? (
                    <div className="py-2">
                      <Link to="/admin/dashboard" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                        <LayoutDashboard className="h-4 w-4 mr-3 text-text-tertiary" /> Tableau de bord
                      </Link>
                      <Link to="/admin/users" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                        <User className="h-4 w-4 mr-3 text-text-tertiary" /> Utilisateurs
                      </Link>
                      <Link to="/admin/stores" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                        <Store className="h-4 w-4 mr-3 text-text-tertiary" /> Boutiques
                      </Link>
                      <Link to="/admin/settings" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                        <Settings className="h-4 w-4 mr-3 text-text-tertiary" /> Paramètres
                      </Link>
                    </div>
                  ) : isSeller ? (
                     <div className="py-2">
                       <Link to="/seller/dashboard" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <LayoutDashboard className="h-4 w-4 mr-3 text-text-tertiary" /> Vue d'ensemble
                       </Link>
                       <Link to="/seller/products" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <Package className="h-4 w-4 mr-3 text-text-tertiary" /> Mes produits
                       </Link>
                       <Link to="/seller/products/new" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <PlusCircle className="h-4 w-4 mr-3 text-text-tertiary" /> Ajouter un produit
                       </Link>
                       <Link to="/seller/orders" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <ShoppingCart className="h-4 w-4 mr-3 text-text-tertiary" /> Commandes reçues
                       </Link>
                       <Link to="/seller/messages" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <MessageSquare className="h-4 w-4 mr-3 text-text-tertiary" /> Messages clients
                       </Link>
                       <Link to="/seller/store" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <Store className="h-4 w-4 mr-3 text-text-tertiary" /> Ma boutique
                       </Link>
                       <Link to="/seller/stats" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <BarChart3 className="h-4 w-4 mr-3 text-text-tertiary" /> Statistiques
                       </Link>
                       <Link to="/seller/finances" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <Wallet className="h-4 w-4 mr-3 text-text-tertiary" /> Finances
                       </Link>
                       <Link to="/seller/settings" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <Settings className="h-4 w-4 mr-3 text-text-tertiary" /> Paramètres
                       </Link>
                     </div>
                   ) : (
                     <div className="py-2">
                       <Link to="/buyer/dashboard" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <LayoutDashboard className="h-4 w-4 mr-3 text-text-tertiary" /> Tableau de bord
                       </Link>
                       <Link to="/buyer/orders" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <ShoppingBag className="h-4 w-4 mr-3 text-text-tertiary" /> Mes commandes
                       </Link>
                       <Link to="/buyer/favorites" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <Heart className="h-4 w-4 mr-3 text-text-tertiary" /> Mes favoris
                       </Link>
                       <Link to="/buyer/messages" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <MessageSquare className="h-4 w-4 mr-3 text-text-tertiary" /> Messages
                       </Link>
                       <Link to="/buyer/addresses" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <MapPin className="h-4 w-4 mr-3 text-text-tertiary" /> Mes adresses
                       </Link>
                       <Link to="/buyer/profile" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <User className="h-4 w-4 mr-3 text-text-tertiary" /> Mon profil
                       </Link>
                       <Link to="/buyer/notifications" className="flex items-center px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface hover:text-black transition-colors">
                         <Bell className="h-4 w-4 mr-3 text-text-tertiary" /> Notifications
                       </Link>
                     </div>
                   )}
                   <div className="py-2 border-t border-border-light bg-surface/30">
                     <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2.5 text-sm font-bold text-danger hover:bg-danger/10 transition-colors">
                        <LogOut className="h-4 w-4 mr-3" /> Déconnexion
                     </button>
                   </div>
                 </div>
               )}
            </div>

                        {user && (
              <Link 
                to={isSeller ? '/seller/messages' : '/buyer/messages'}
                className="relative p-2 border border-border-light rounded-full text-text-primary hover:border-text-primary transition-colors flex items-center justify-center mr-2"
              >
                <MessageSquare className="h-4 w-4" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </span>
                )}
              </Link>
            )}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 border border-border-light rounded-full text-text-primary hover:border-text-primary transition-colors flex items-center justify-center"
            >
              <ShoppingCart className="h-4 w-4" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-text-primary p-2 border border-border-light rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer... kept simple */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
             <div className="p-4 flex items-center justify-between border-b border-border-light">
                <span className="font-bold text-lg">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)}><X className="h-5 w-5" /></button>
             </div>
             <div className="p-4 flex flex-col space-y-4">
               <Link to="/" className="font-bold text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>{t('home')}</Link>
               <Link to="/products" className="font-bold text-text-secondary" onClick={() => setIsMobileMenuOpen(false)}>Boutique</Link>
               <Link to="/services" className="font-bold text-text-secondary" onClick={() => setIsMobileMenuOpen(false)}>{t('services')}</Link>
               <Link to="/products" className="font-bold text-text-secondary" onClick={() => setIsMobileMenuOpen(false)}>Nouveautés</Link>
               {user ? (
                 <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-left font-bold text-danger mt-4">Déconnexion</button>
               ) : (
                 <Link to="/auth/login" className="font-bold text-accent mt-4" onClick={() => setIsMobileMenuOpen(false)}>Connexion / Inscription</Link>
               )}
             </div>
          </div>
        </div>
      )}
    </header>
  );
}
