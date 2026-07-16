import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Store, Product, Service, StorePortfolio } from '../../types';
import { MapPin, Star, Phone, Mail, Globe, Facebook, Instagram, Store as StoreIcon, MessageSquare } from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard';

export function VendorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolios, setPortfolios] = useState<StorePortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs: 'about', 'products', 'services', 'portfolio'
  const [activeTab, setActiveTab] = useState<'about' | 'products' | 'services' | 'portfolio'>('products');

  useEffect(() => {
    if (id) {
      fetchVendorDetails(id);
    }
  }, [id]);

  const fetchVendorDetails = async (vendorId: string) => {
    if (!supabase) return;
    try {
      setLoading(true);
      
      // 1. Fetch Vendor (Store)
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', vendorId)
        .single();
        
      if (storeError) throw storeError;
      setVendor(storeData);

      // 2. Fetch Products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id);
        
      if (productsData) setProducts(productsData);

      // 3. Fetch Services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('store_id', storeData.id);
        
      if (servicesData) setServices(servicesData);

      // 4. Fetch Portfolios
      const { data: portfolioData } = await supabase
        .from('store_portfolios')
        .select('*')
        .eq('store_id', vendorId)
        .order('created_at', { ascending: false });
        
      if (portfolioData) setPortfolios(portfolioData);
      
    } catch (error) {
      console.error('Error fetching vendor details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-3xl mb-8"></div>
        <div className="h-10 w-64 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-32">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendeur introuvable</h2>
        <Link to="/vendors" className="text-accent hover:underline">Retour à l'annuaire</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* HEADER / COVER */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full bg-gray-200">
        {vendor.cover_image || vendor.banner ? (
          <img 
            src={vendor.cover_image || vendor.banner} 
            alt="Cover" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-600"></div>
        )}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24">
        <div className="bg-white rounded-3xl shadow-xl border border-border-light p-6 md:p-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Logo */}
            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-2xl overflow-hidden border-4 border-white bg-white shadow-md relative -mt-16 md:-mt-20">
              {vendor.logo ? (
                <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-accent/10 flex items-center justify-center">
                  <StoreIcon className="w-16 h-16 text-accent" />
                </div>
              )}
            </div>

            {/* Infos principales */}
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{vendor.name}</h1>
                  {vendor.categories && vendor.categories.length > 0 && (
                    <p className="text-lg text-gray-500 font-medium mb-3">{vendor.categories.join(', ')}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <div className="flex items-center gap-1.5 bg-[#FFC107]/10 text-[#FFC107] px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{vendor.rating ? vendor.rating.toFixed(1) : 'Nouveau'}</span>
                    </div>
                    {vendor.region && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {vendor.region}
                      </div>
                    )}
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3">
                  <button className="flex-1 md:flex-none px-6 py-3 bg-accent text-white font-bold rounded-xl shadow-md hover:bg-accent/90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                    <MessageSquare className="w-5 h-5" /> Contacter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Onglets (Tabs) */}
          <div className="flex overflow-x-auto border-b border-gray-200 mt-10 scrollbar-hide">
            <button 
              onClick={() => setActiveTab('products')}
              className={`pb-4 px-6 font-bold whitespace-nowrap transition-colors ${activeTab === 'products' ? 'border-b-2 border-accent text-accent' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Produits ({products.length})
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={`pb-4 px-6 font-bold whitespace-nowrap transition-colors ${activeTab === 'services' ? 'border-b-2 border-accent text-accent' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Services ({services.length})
            </button>
            <button 
              onClick={() => setActiveTab('portfolio')}
              className={`pb-4 px-6 font-bold whitespace-nowrap transition-colors ${activeTab === 'portfolio' ? 'border-b-2 border-accent text-accent' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Portfolio ({portfolios.length})
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className={`pb-4 px-6 font-bold whitespace-nowrap transition-colors ${activeTab === 'about' ? 'border-b-2 border-accent text-accent' : 'text-gray-500 hover:text-gray-900'}`}
            >
              À propos
            </button>
          </div>
        </div>

        {/* CONTENU DES ONGLETS */}
        <div className="mt-8">
          
          {/* Onglet: À PROPOS */}
          {activeTab === 'about' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-border-light p-8">
                <h3 className="text-xl font-bold mb-6 text-gray-900">Description de l'entreprise</h3>
                <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                  {vendor.description || "Aucune description fournie par ce vendeur."}
                </div>
              </div>
              
              <div className="bg-white rounded-3xl shadow-sm border border-border-light p-8 h-fit">
                <h3 className="text-lg font-bold mb-6 text-gray-900">Informations de contact</h3>
                <div className="space-y-4">
                  {vendor.phone && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="font-medium">{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="font-medium">{vendor.email}</span>
                    </div>
                  )}
                  {vendor.address && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="font-medium">{vendor.address}</span>
                    </div>
                  )}
                  {vendor.website_url && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5 text-gray-400" />
                      </div>
                      <a href={vendor.website_url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">
                        Site web
                      </a>
                    </div>
                  )}
                </div>

                {/* Réseaux sociaux */}
                {(vendor.facebook_url || vendor.instagram_url) && (
                  <>
                    <hr className="my-6 border-gray-100" />
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Réseaux Sociaux</h3>
                    <div className="flex gap-3">
                      {vendor.facebook_url && (
                        <a href={vendor.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2]/20 transition-colors">
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                      {vendor.instagram_url && (
                        <a href={vendor.instagram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#E4405F]/10 text-[#E4405F] flex items-center justify-center hover:bg-[#E4405F]/20 transition-colors">
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Onglet: PRODUITS */}
          {activeTab === 'products' && (
            products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-border-light p-12 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun produit</h3>
                <p className="text-gray-500">Ce vendeur n'a pas encore ajouté de produits.</p>
              </div>
            )
          )}

          {/* Onglet: SERVICES */}
          {activeTab === 'services' && (
            services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <Link key={service.id} to={`/service/${service.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border-light hover:shadow-md transition-all group">
                    <div className="h-48 overflow-hidden">
                      <img src={service.images?.[0] || 'https://via.placeholder.com/400'} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-2">{service.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-accent">{service.price.toLocaleString()} FCFA</span>
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">{service.priceType === 'fixed' ? 'Fixe' : service.priceType === 'hourly' ? '/ Heure' : 'À partir de'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-border-light p-12 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun service</h3>
                <p className="text-gray-500">Ce vendeur n'a pas encore ajouté de services.</p>
              </div>
            )
          )}

          {/* Onglet: PORTFOLIO */}
          {activeTab === 'portfolio' && (
            portfolios.length > 0 ? (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {portfolios.map(item => (
                  <div key={item.id} className="break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-sm border border-border-light group cursor-pointer">
                    <div className="relative overflow-hidden">
                      <img src={item.image_url} alt={item.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <h3 className="text-white font-bold text-lg">{item.title}</h3>
                        {item.description && <p className="text-white/80 text-sm mt-1">{item.description}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-border-light p-12 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Portfolio vide</h3>
                <p className="text-gray-500">Ce vendeur n'a pas encore ajouté de réalisations à son portfolio.</p>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}
