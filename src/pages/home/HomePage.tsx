import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronRight, Star, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCategories } from '../../contexts/CategoriesContext';

import { ProductCard } from '../../components/product/ProductCard';
import { ProductCardSkeleton } from '../../components/product/ProductCard';
import { VendorCarousel } from '../../components/vendors/VendorCarousel';
import { useProducts } from '../../hooks/useProducts';
import { supabase } from '../../lib/supabase';

export function HomePage() {
  const { productCategories, isLoading: categoriesLoading } = useCategories();
  const [promoBanners, setPromoBanners] = useState([]);
  const { products, isLoading: productsLoading } = useProducts();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: banners } = await supabase.from('banners').select('*');
      if (banners) setPromoBanners(banners.filter(b => b.is_active));
      
      const { data } = await supabase
        .from('products')
        .select('*, company:companies(legal_name, logo_url)')
        .eq('is_active', true)
        .order('views', { ascending: false })
        .limit(4);
      
      if (data) setFeaturedProducts(data);
      setLoadingFeatured(false);
    }
    loadData();
  }, []);

  const newProducts = products.slice(0, 4);
  const popularProducts = products.slice(4, 12);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-black selection:text-white pb-24">
      {/* 1. PREMIUM HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-white to-white -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-sm font-medium text-zinc-800 mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
          Découvrez la nouvelle marketplace B2B & B2C
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-950 max-w-4xl mb-6"
        >
          L'excellence du commerce <span className="text-zinc-500">en Afrique.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-500 max-w-2xl mb-10"
        >
          Trouvez des fournisseurs vérifiés, des services de haute qualité et développez votre activité avec la plateforme la plus avancée du continent.
        </motion.p>

        {/* Global Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-2xl relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 to-zinc-100 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center bg-white border border-zinc-200 rounded-xl shadow-sm p-2 hover:border-zinc-300 transition-colors">
            <Search className="w-6 h-6 text-zinc-400 ml-3" />
            <input 
              type="text" 
              placeholder="Que recherchez-vous aujourd'hui ?" 
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg px-4 py-3 outline-none placeholder:text-zinc-400"
            />
            <button className="bg-zinc-950 text-white px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 transition-colors shadow-sm">
              Rechercher
            </button>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-8"
        >
          <span className="text-sm text-zinc-500 font-medium">Recherches populaires:</span>
          {['Agroalimentaire', 'Services IT', 'Équipement Industriel', 'Mode locale'].map((tag, i) => (
            <button key={i} className="text-sm px-4 py-1.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-colors text-zinc-600 font-medium">
              {tag}
            </button>
          ))}
        </motion.div>
      </section>

      {/* 2. VALUE PROPOSITION */}
      <section className="py-16 bg-zinc-50 border-y border-zinc-200/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: ShieldCheck, title: "Entreprises Vérifiées", desc: "KYC rigoureux pour garantir la fiabilité des partenaires." },
              { icon: Zap, title: "Transactions Rapides", desc: "Processus de commande et de devis ultra-optimisés." },
              { icon: TrendingUp, title: "Croissance Garantie", desc: "Outils avancés pour développer votre visibilité." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center mb-4 text-zinc-900">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-20">
        {/* 3. CATEGORIES BENTO GRID */}
        <section className="mb-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Explorez le catalogue</h2>
              <p className="text-zinc-500">Naviguez par catégories industrielles et de services.</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Voir tout <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categoriesLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-zinc-100 animate-pulse rounded-xl" />
              ))
            ) : (
              productCategories.slice(0, 12).map((cat, i) => (
                <Link key={cat.id} to={`/products?category=${cat.slug}`} className="group flex flex-col items-center justify-center p-6 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 hover:shadow-md transition-all duration-300">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {cat.icon_name || '📦'}
                  </div>
                  <span className="text-sm font-medium text-zinc-700 text-center">{cat.name}</span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* 4. VENDORS HIGHLIGHT */}
        <section className="mb-24">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Vendeurs d'élite</h2>
            <p className="text-zinc-500">Découvrez les entreprises certifiées les plus performantes.</p>
          </div>
          <VendorCarousel />
        </section>

        {/* 5. NEW PRODUCTS */}
        <section className="mb-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Nouveautés</h2>
              <p className="text-zinc-500">Les derniers ajouts sur la marketplace.</p>
            </div>
            <Link to="/products" className="flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm hover:border-zinc-300">
              Voir la collection complète
            </Link>
          </div>
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {productsLoading ? (
              Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
              newProducts.map(product => (
                <motion.div variants={item} key={product.id}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </motion.div>
        </section>

        {/* 6. PROMO BANNER (Linear aesthetic) */}
        {promoBanners[0] && (
          <section className="mb-24">
            <div className="relative rounded-3xl overflow-hidden bg-zinc-950 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between border border-zinc-800">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent pointer-events-none" />
              <div className="relative z-10 max-w-xl text-center md:text-left mb-8 md:mb-0">
                <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">{promoBanners[0].title}</h3>
                <p className="text-zinc-400 text-lg mb-8">{promoBanners[0].subtitle}</p>
                {promoBanners[0].button_text && (
                  <Link to={promoBanners[0].button_link || '#'} className="inline-flex items-center justify-center bg-white text-zinc-950 px-8 py-3 rounded-full font-medium hover:bg-zinc-100 transition-colors">
                    {promoBanners[0].button_text}
                  </Link>
                )}
              </div>
              <div className="relative z-10 w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
                <img src={promoBanners[0].image_url} alt="Promo" className="w-full h-full object-cover" />
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
