import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useServices(options: any = {}) {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    const fetchServices = async () => {
      let q = supabase.from('services').select('*');
      if (options.category) q = q.eq('category', options.category);
      
      if (options.sellerId) q = q.eq('store_id', options.sellerId);
      let data = null;
      try {
        const res = await q;
        data = res.data;
      } catch(e) {
        console.error("useServices fetch error:", e);
      }
      if (data) setServices(data);
      setIsLoading(false);
    };
    fetchServices();
  }, [options.category, options.region, options.sellerId]);

  return { services, isLoading };
}
