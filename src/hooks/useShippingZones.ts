import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShippingZone } from '../components/admin/AdminShippingZones';

export function useShippingZones() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    const fetchZones = async () => {
      const { data, error } = await supabase.from('shipping_zones').select('*').order('name', { ascending: true });
      if (!error && data) setZones(data);
      setIsLoading(false);
    };
    fetchZones();
  }, []);

  return { zones, isLoading };
}
