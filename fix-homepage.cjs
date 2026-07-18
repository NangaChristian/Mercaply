const fs = require('fs');

const code = `
import { useCategories } from '../../contexts/CategoriesContext';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard, ProductCardSkeleton } from '../../components/product/ProductCard';
import { VendorCarousel } from '../../components/vendors/VendorCarousel';
import { cn } from '../../utils/cn';
import { Star, MessageSquare, ShieldCheck, ChevronLeft, ChevronRight, Box, Menu, Settings, Wrench, Briefcase, Paintbrush, Camera, BookOpen, Laptop, TrendingUp, PenTool, Users, Hammer } from 'lucide-react';

export function HomePage() {
  const { productCategories: PRODUCT_CATEGORIES, serviceCategories: SERVICE_CATEGORIES } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [promoBanners, setPromoBanners] = useState<any[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      if (!supabase) return;
      try {
        const { data: slidesData } = await supabase.from('hero_slides').select('*').eq('is_active', true).order('display_order', { ascending: true });
        const { data: bannersData } = await supabase.from('promotional_banners').select('*').eq('is_active', true).order('display_order', { ascending: true });
        
        if (slidesData && slidesData.length > 0) {
          const parsedSlides = slidesData.map(doc => {
            const slide = doc;
            let mainImg = slide.image_url;
            let coverImg = '';
            if (mainImg && mainImg.includes('|||')) {
              [mainImg, coverImg] = mainImg.split('|||');
            }
            return { ...slide, id: doc.id, image_url: mainImg, cover_image_url: coverImg };
          });
          setHeroSlides(parsedSlides);
        }
        
        if (bannersData && bannersData.length > 0) {
          setPromoBanners(bannersData);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const { products, isLoading } = useProducts({ limitCount: 20 });
  const { products: featuredProducts, isLoading: loadingFeatured } = useProducts({ limitCount: 4 });

  // Mock Countdown Timer state
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 35, minutes: 40, seconds: 40 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const newProducts = products.slice(0, 4);
  const popularProducts = products.slice(4, 12);
  
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'laptop': return Laptop;
      case 'palette': return Paintbrush;
      case 'trending-up': return TrendingUp;
      case 'pen-tool': return PenTool;
      case 'users': return Users;
      case 'hammer': return Hammer;
      case 'briefcase': return Briefcase;
      case 'book-open': return BookOpen;
      default: return Wrench;
    }
  };

  const serviceCategoriesNames = SERVICE_CATEGORIES.map(c => c.name);
  const realServices = products.filter(p => serviceCategoriesNames.includes(p.category || ''));
  const topServices = realServices.slice(0, 4);

  const renderBanner = (banner: any) => {
    if (!banner) return null;
    return (
      <section key={banner.id} className="mb-16 rounded-[2rem] p-12 text-center flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
         <div className="absolute inset-0 z-0">
            <img 
               src={banner.image_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80"} 
               alt={banner.title || "Banner"}
               className="w-full h-full object-cover" 
               referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
         </div>
         <div className="relative z-10 text-white">
            {banner.subtitle && <div className="text-accent font-bold tracking-widest uppercase mb-4 text-sm">{banner.subtitle}</div>}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight whitespace-pre-line">
              {banner.title ? banner.title.replace(/\\\\n/g, '\\n') : ''}
            </h2>
            {banner.button_text && (
               <Link to={banner.button_link || '#'} className="px-10 py-4 bg-accent text-white font-bold rounded-full shadow-xl hover:-translate-y-0.5 hover:shadow-2xl transition-all inline-block mt-4">
                  {banner.button_text}
               </Link>
            )}
         </div>
      </section>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-4 md:pt-8 bg-background">
      
      {/* 1. HERO SECTION */}
      <section className="flex flex-col lg:flex-row gap-6 mb-12 relative z-10 w-full mt-4">
        <div className="flex-1 rounded-lg overflow-hidden relative flex items-center p-8 md:p-12" style={{  backgroundColor: heroSlides[currentSlideIndex]?.cover_image_url ? 'transparent' : '#111111'}}>
          {heroSlides[currentSlideIndex]?.cover_image_url && (
            <div className="absolute inset-0 -z-10">
              <img src={heroSlides[currentSlideIndex].cover_image_url} alt="Cover" className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
            </div>
          )}
          {heroSlides.length > 0 && (
            <>
              <div className="absolute top-0 right-0 bottom-0 w-1/2 flex items-center justify-center -z-0">
                <div className="w-[80%] h-[80%] border border-white/5 rounded-full absolute"></div>
                <div className="w-[60%] h-[60%] border border-white/5 rounded-full absolute"></div>
                <div className="w-[40%] h-[40%] border border-white/5 rounded-full absolute"></div>
                <img 
                  src={heroSlides[currentSlideIndex].image_url} 
                  alt={heroSlides[currentSlideIndex].title}
                  className="relative z-10 w-[80%] max-w-[400px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="relative z-10 lg:w-[60%] text-white">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[#FFC107]">//</span>
                    <span className="text-[#FFC107] font-medium text-sm italic">{heroSlides[currentSlideIndex].subtitle}</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
                  {heroSlides[currentSlideIndex].title}
                </h1>
                {heroSlides[currentSlideIndex].button_text && (
                  <Link to={heroSlides[currentSlideIndex].button_link || '#'} className="inline-block px-8 py-3 bg-[#FFC107] text-black font-bold text-sm lg:text-base rounded shadow-md hover:-translate-y-0.5 transition-transform">
                    {heroSlides[currentSlideIndex].button_text}
                  </Link>
                )}
              </div>
              {heroSlides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {heroSlides.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={\`w-2 h-2 rounded-full \${idx === currentSlideIndex ? 'bg-[#FFC107]' : 'bg-white/30'}\`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 2. PROMO BANNERS SECTION (TOP 2) */}
      {promoBanners.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {promoBanners[0] && (
            <div key={promoBanners[0].id} className="relative rounded-lg overflow-hidden h-[240px] flex items-center bg-[#F3F4F6] group">
              <div className="absolute right-0 top-0 bottom-0 w-1/2">
                 <img src={promoBanners[0].image_url} alt={promoBanners[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                 <div className="absolute inset-0 bg-gradient-to-r from-[#F3F4F6] via-[#F3F4F6]/80 to-transparent"></div>
              </div>
              <div className="relative z-10 p-8 w-2/3">
                 <div className="text-accent font-bold mb-2">{promoBanners[0].subtitle}</div>
                 <h3 className="text-2xl font-bold mb-4 text-black whitespace-pre-line">{promoBanners[0].title.replace(/\\\\n/g, '\\n')}</h3>
                 {promoBanners[0].button_text && (
                   <Link to={promoBanners[0].button_link || '#'} className="text-sm font-bold border-b-2 border-accent text-accent pb-1 hover:text-black hover:border-black transition-colors">
                     {promoBanners[0].button_text}
                   </Link>
                 )}
              </div>
            </div>
          )}
          {promoBanners[1] && (
            <div key={promoBanners[1].id} className="relative rounded-lg overflow-hidden h-[240px] flex items-center bg-[#1A1A24] group">
              <div className="absolute right-0 top-0 bottom-0 w-1/2">
                 <img src={promoBanners[1].image_url} alt={promoBanners[1].title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                 <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A24] via-[#1A1A24]/80 to-transparent"></div>
              </div>
              <div className="relative z-10 p-8 w-2/3">
                 <div className="text-[#FFC107] font-bold mb-2">{promoBanners[1].subtitle}</div>
                 <h3 className="text-2xl font-bold mb-4 text-white whitespace-pre-line">{promoBanners[1].title.replace(/\\\\n/g, '\\n')}</h3>
                 {promoBanners[1].button_text && (
                   <Link to={promoBanners[1].button_link || '#'} className="text-sm font-bold border-b-2 border-[#FFC107] text-[#FFC107] pb-1 hover:text-white hover:border-white transition-colors">
                     {promoBanners[1].button_text}
                   </Link>
                 )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* VENDORS CAROUSEL SECTION */}
      <section className="mb-16 bg-surface p-8 rounded-2xl border border-border-light">
        <div className="flex items-center justify-between mb-8">
           <div>
             <h2 className="text-2xl font-bold text-text-primary mb-1">Vendeurs à la Une</h2>
             <p className="text-text-secondary text-sm">Découvrez nos meilleurs vendeurs recommandés.</p>
           </div>
           <Link to="/vendors" className="bg-white border border-border-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-2 transition-colors">
             Voir tous les vendeurs
           </Link>
        </div>
        <VendorCarousel />
      </section>

      {/* 3. NEW PRODUCTS SECTION */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
           <div>
             <h2 className="text-2xl font-bold text-text-primary mb-1">Nouveautés</h2>
             <p className="text-text-secondary text-sm">Découvrez nos derniers articles ajoutés</p>
           </div>
           <Link to="/products" className="bg-white border border-border-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-2 transition-colors">
             Voir tout
           </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            newProducts.map(product => <ProductCard key={product.id} product={product} />)
          )}
        </div>
      </section>

      {/* Banner Index 2 */}
      {promoBanners.length > 2 && renderBanner(promoBanners[2])}

      {/* 4. POPULAR PRODUCTS SECTION */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
           <div>
             <h2 className="text-2xl font-bold text-text-primary mb-1">Produits Populaires</h2>
             <p className="text-text-secondary text-sm">Les articles les plus appréciés par nos clients</p>
           </div>
           <Link to="/products" className="bg-white border border-border-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-2 transition-colors">
             Voir tout
           </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            popularProducts.map(product => <ProductCard key={product.id} product={product} />)
          )}
        </div>
      </section>

      {/* 5. MOST RATED SERVICES SECTION */}
      <section className="mb-16 bg-surface p-8 rounded-2xl border border-border-light">
        <div className="flex items-center justify-between mb-8">
           <div>
             <h2 className="text-2xl font-bold text-text-primary mb-1">Services les Mieux Notés</h2>
             <p className="text-text-secondary text-sm">Des professionnels de premier plan prêts à vous aider.</p>
           </div>
           <button className="bg-white border border-border-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-2 transition-colors">
             Explorer les Services
           </button>        
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topServices.map((service) => {
            const categoryData = SERVICE_CATEGORIES.find(c => c.name === service.category);
            const Icon = getServiceIcon(categoryData?.icon || '');
            return (
              <div key={service.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-border-light hover:shadow-md transition-shadow group cursor-pointer">
                <div className="relative h-40 overflow-hidden">
                  <img src={service.images?.[0] || 'https://via.placeholder.com/400'} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-black mb-2">{service.title}</h3>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Star className="w-4 h-4 text-[#FFC107] fill-[#FFC107]" />
                    <span className="font-bold">{(4.5 + Math.random() * 0.5).toFixed(1)}</span>
                    <span className="text-text-tertiary">({Math.floor(Math.random() * 200) + 50} avis)</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Banner Index 3 */}
      {promoBanners.length > 3 && renderBanner(promoBanners[3])}

      {/* 6. FEATURED PRODUCTS SECTION */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
           <div>
             <h2 className="text-2xl font-bold text-text-primary mb-1">Notre Sélection</h2>
             <p className="text-text-secondary text-sm">Produits soigneusement sélectionnés pour vous</p>
           </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loadingFeatured ? (
            Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            featuredProducts.map(product => <ProductCard key={product.id} product={product} />)
          )}
        </div>
      </section>

      {/* ANY REMAINING BANNERS */}
      {promoBanners.length > 4 && (
        <div className="space-y-16 mb-16">
          {promoBanners.slice(4).map(banner => renderBanner(banner))}
        </div>
      )}

    </div>
  );
}
`;

fs.writeFileSync('src/pages/home/HomePage.tsx', code, 'utf-8');
