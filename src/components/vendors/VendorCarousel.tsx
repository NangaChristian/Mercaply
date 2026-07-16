import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Store as StoreIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Store } from '../../types';

export function VendorCarousel() {
  const [vendors, setVendors] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    if (!supabase) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('rating', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden py-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="min-w-[280px] h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (vendors.length === 0) return null;

  return (
    <div className="relative group">
      <div 
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {vendors.map((vendor) => (
          <Link 
            key={vendor.id}
            to={`/vendors/${vendor.id}`}
            className="min-w-[280px] sm:min-w-[300px] snap-start bg-white rounded-2xl p-5 border border-border-light hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center group/card"
          >
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-surface shadow-sm">
              {vendor.logo ? (
                <img 
                  src={vendor.logo} 
                  alt={vendor.name} 
                  className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-accent/10 flex items-center justify-center">
                  <StoreIcon className="w-10 h-10 text-accent" />
                </div>
              )}
            </div>
            
            <h3 className="font-bold text-lg text-text-primary mb-1">{vendor.name}</h3>
            
            {vendor.categories && vendor.categories.length > 0 && (
              <p className="text-sm text-text-secondary mb-3">{vendor.categories[0]}</p>
            )}
            
            <div className="flex items-center gap-1.5 mt-auto">
              <Star className="w-4 h-4 text-[#FFC107] fill-[#FFC107]" />
              <span className="font-bold">{vendor.rating ? vendor.rating.toFixed(1) : 'Nouveau'}</span>
            </div>
          </Link>
        ))}
      </div>

      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-10 h-10 bg-white rounded-full shadow-lg border border-border-light flex items-center justify-center text-text-secondary hover:text-accent opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all disabled:opacity-0"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-10 h-10 bg-white rounded-full shadow-lg border border-border-light flex items-center justify-center text-text-secondary hover:text-accent opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all disabled:opacity-0"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
