import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PRODUCT_CATEGORIES as FALLBACK_P, SERVICE_CATEGORIES as FALLBACK_S } from '../constants';

interface CategoryContextType {
  productCategories: any[];
  serviceCategories: any[];
  isLoading: boolean;
}

const CategoriesContext = createContext<CategoryContextType>({
  productCategories: FALLBACK_P,
  serviceCategories: FALLBACK_S,
  isLoading: true
});

export const useCategories = () => useContext(CategoriesContext);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [productCategories, setProductCategories] = useState(FALLBACK_P);
  const [serviceCategories, setServiceCategories] = useState(FALLBACK_S);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await supabase.from('categories').select('*').order('display_order');
        if (data && data.length > 0) {
          const pCats = data.filter(c => c.type === 'product').map(c => ({ id: c.name, name: c.name, icon: c.icon_url || 'box' }));
          const sCats = data.filter(c => c.type === 'service').map(c => ({ id: c.name, name: c.name, icon: c.icon_url || 'briefcase' }));
          if (pCats.length > 0) setProductCategories(pCats);
          if (sCats.length > 0) setServiceCategories(sCats);
        }
      } catch (e) {
        console.error("Error fetching categories", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <CategoriesContext.Provider value={{ productCategories, serviceCategories, isLoading }}>
      {children}
    </CategoriesContext.Provider>
  );
}
