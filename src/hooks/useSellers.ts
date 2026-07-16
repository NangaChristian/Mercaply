import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSellers(limitCount?: number) {
  const [sellers, setSellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    const fetchSellers = async () => {
      let q = supabase.from('stores').select('*');
      if (limitCount) q = q.limit(limitCount);
      const { data } = await q;
      if (data) setSellers(data);
      setIsLoading(false);
    };
    fetchSellers();
  }, [limitCount]);

  return { sellers, isLoading };
}
