import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Filter, Store as StoreIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Store } from '../../types';

export function VendorsDirectoryPage() {
  const [vendors, setVendors] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');

  // Derive unique categories and regions from data
  const [categories, setCategories] = useState<string[]>(['All']);
  const [regions, setRegions] = useState<string[]>(['All']);

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
        .order('rating', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setVendors(data);
        
        // Extract unique categories and regions
        const uniqueCategories = new Set<string>();
        const uniqueRegions = new Set<string>();
        
        data.forEach(store => {
          if (store.region) uniqueRegions.add(store.region);
          if (store.categories) {
            store.categories.forEach((cat: string) => uniqueCategories.add(cat));
          }
        });
        
        setCategories(['All', ...Array.from(uniqueCategories)]);
        setRegions(['All', ...Array.from(uniqueRegions)]);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (vendor.categories && vendor.categories.includes(selectedCategory));
    const matchesRegion = selectedRegion === 'All' || vendor.region === selectedRegion;
    
    return matchesSearch && matchesCategory && matchesRegion;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Annuaire des Vendeurs</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Découvrez les meilleures entreprises et professionnels sur notre plateforme.</p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-border-light mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Rechercher une entreprise..." 
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select 
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none appearance-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'Toutes les catégories' : cat}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select 
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-accent outline-none appearance-none"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {regions.map(reg => (
                <option key={reg} value={reg}>{reg === 'All' ? 'Toutes les régions' : reg}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grille des résultats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVendors.map(vendor => (
            <Link 
              key={vendor.id}
              to={`/vendors/${vendor.id}`}
              className="bg-white rounded-2xl overflow-hidden border border-border-light hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              <div className="h-24 bg-gray-100 relative">
                {vendor.banner && (
                  <img src={vendor.banner} alt="Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white bg-white shadow-sm">
                    {vendor.logo ? (
                      <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-accent/10 flex items-center justify-center">
                        <StoreIcon className="w-8 h-8 text-accent" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 pt-12 flex-1 flex flex-col">
                <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-accent transition-colors">{vendor.name}</h3>
                
                {vendor.categories && vendor.categories.length > 0 && (
                  <p className="text-sm text-gray-500 mb-3">{vendor.categories[0]}</p>
                )}
                
                <div className="flex items-center gap-1.5 mt-auto text-sm">
                  <Star className="w-4 h-4 text-[#FFC107] fill-[#FFC107]" />
                  <span className="font-bold text-gray-900">{vendor.rating ? vendor.rating.toFixed(1) : 'Nouveau'}</span>
                  {vendor.region && (
                    <>
                      <span className="text-gray-300 mx-1">•</span>
                      <span className="text-gray-500 flex items-center"><MapPin className="w-3 h-3 mr-1"/> {vendor.region}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-border-light">
          <StoreIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun vendeur trouvé</h3>
          <p className="text-gray-500">Essayez de modifier vos filtres de recherche.</p>
        </div>
      )}
    </div>
  );
}
