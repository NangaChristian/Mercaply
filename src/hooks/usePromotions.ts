import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function usePromotions() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    const fetchPromos = async () => {
      let data = null;
      try {
        const res = await supabase.from('promotions').select('*').eq('isActive', true);
        data = res.data;
      } catch (e) {
        console.error(e);
      }
      if (data) setPromotions(data);
      setIsLoading(false);
    };
    fetchPromos();
  }, []);

  return { promotions, isLoading };
}
