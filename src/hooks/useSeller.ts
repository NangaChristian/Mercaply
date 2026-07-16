import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSeller(sellerId?: string) {
  const [seller, setSeller] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sellerId || !supabase) {
      setIsLoading(false);
      return;
    }
    const fetchSeller = async () => {
      const { data } = await supabase.from('stores').select('*').eq('id', sellerId).single();
      if (data) {
        setSeller(data);
      } else {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', sellerId).single();
        setSeller(profile);
      }
      setIsLoading(false);
    };
    fetchSeller();
  }, [sellerId]);

  return { seller, isLoading };
}
