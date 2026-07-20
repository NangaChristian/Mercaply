import { useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { useToast } from '../../store/useToast';
import { supabase } from '../../lib/supabase';

export function OrderNotifications() {
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (!user?.uid || !supabase) return;

    // Supabase Realtime for orders
    const channel = supabase
      .channel('orders_channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `buyer_id=eq.${user.uid}`,
        },
        (payload) => {
          const oldStatus = payload.old?.status;
          const newStatus = payload.new?.status;
          if (oldStatus !== newStatus && newStatus) {
            addToast('info', `Le statut de votre commande #${payload.new.id.substring(0, 6)} est passé à : ${newStatus}`);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `seller_id=eq.${user.uid}`,
        },
        (payload) => {
          if (payload.new?.id) {
            addToast('success', `Nouvelle commande reçue ! #${payload.new.id.substring(0, 6)}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.uid, addToast]);

  return null;
}
