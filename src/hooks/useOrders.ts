import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useOrders(userId: string, role: 'buyer' | 'seller') {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || !supabase) {
      setIsLoading(false);
      return;
    }
    const fetchOrders = async () => {
      const field = role === 'seller' ? 'seller_id' : 'buyer_id';
      let data = null;
      try {
        const res = await supabase.from('orders').select('*').eq(field, userId).order('created_at', { ascending: false });
        data = res.data;
      } catch(e) {
        console.error("useOrders fetch error:", e);
      }
      if (data) setOrders(data);
      setIsLoading(false);
    };
    fetchOrders();
  }, [userId, role]);

  return { orders, isLoading };
}
