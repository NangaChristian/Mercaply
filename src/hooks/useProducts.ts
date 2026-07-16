import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

interface UseProductsOptions {
  sellerId?: string;
  category?: string;
  region?: string;
  limitCount?: number;
  isFlashSale?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      if (!supabase) return;
      try {
        let query = supabase.from('products').select('*').order('created_at', { ascending: false });
        
        if (options.category) query = query.eq('category', options.category);
        
        if (options.sellerId) query = query.eq('store_id', options.sellerId);
        if (options.limitCount) query = query.limit(options.limitCount);

        const { data, error } = await query;
        if (error) throw error;
        
        setProducts(data as any[]);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [options.category, options.region, options.limitCount, options.isFlashSale, options.sellerId]);

  return { products, isLoading, error };
}
