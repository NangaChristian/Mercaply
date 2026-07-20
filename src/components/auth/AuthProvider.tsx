import { useEffect, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/useAuth';
import { User as AppUser } from '../../types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setSupabaseUser, setUser, setLoading } = useAuth();

  useEffect(() => {
    let mounted = true;

    if (!supabase) {
      if (mounted) setLoading(false);
      return;
    }

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session && mounted) {
          setSupabaseUser(session.user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const metaRole = session.user?.user_metadata?.role;
          let finalRole = profile?.role || metaRole || 'buyer';
          
          if (metaRole === 'seller' && profile?.role !== 'seller') {
            // Fix conflict: update profile role to seller since trigger defaulted to buyer
            const { error: pErr } = await supabase.from('profiles').update({ role: 'seller' }).eq('id', session.user.id);
            if (!pErr) finalRole = 'seller';
            
            const storeName = session.user?.user_metadata?.store_name;
            if (storeName) {
              const { data: store } = await supabase.from('stores').select('id').eq('id', session.user.id).single();
              if (!store) {
                await supabase.from('stores').insert([{
                  id: session.user.id,
                  name: storeName,
                  description: session.user?.user_metadata?.store_description
                }]);
              }
            }
          }

          if (profile) {
            setUser({
              uid: session.user.id,
              email: session.user.email || '',
              role: finalRole,
              createdAt: profile.created_at || new Date().toISOString(),
              isVerified: profile.is_verified || false,
            } as AppUser);
          } else {
            setUser({
              uid: session.user.id,
              email: session.user.email || '',
              role: finalRole,
              createdAt: new Date().toISOString(),
              isVerified: false,
            } as AppUser);
          }
          setLoading(false);
        } else if (mounted) {
          setSupabaseUser(null);
          setUser(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        if (mounted) setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        if (session && mounted) {
          setSupabaseUser(session.user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const metaRole = session.user?.user_metadata?.role;
          let finalRole = profile?.role || metaRole || 'buyer';
          
          if (metaRole === 'seller' && profile?.role !== 'seller') {
            // Fix conflict: update profile role to seller since trigger defaulted to buyer
            const { error: pErr } = await supabase.from('profiles').update({ role: 'seller' }).eq('id', session.user.id);
            if (!pErr) finalRole = 'seller';
            
            const storeName = session.user?.user_metadata?.store_name;
            if (storeName) {
              const { data: store } = await supabase.from('stores').select('id').eq('id', session.user.id).single();
              if (!store) {
                await supabase.from('stores').insert([{
                  id: session.user.id,
                  name: storeName,
                  description: session.user?.user_metadata?.store_description
                }]);
              }
            }
          }

          if (profile) {
            setUser({
              uid: session.user.id,
              email: session.user.email || '',
              role: finalRole,
              createdAt: profile.created_at || new Date().toISOString(),
              isVerified: profile.is_verified || false,
            } as AppUser);
          } else {
            setUser({
              uid: session.user.id,
              email: session.user.email || '',
              role: finalRole,
              createdAt: new Date().toISOString(),
              isVerified: false,
            } as AppUser);
          }
          setLoading(false);
        } else if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error("Get session error:", err);
        if (mounted) setLoading(false);
      }
    }).catch(err => {
      console.error("Get session outer error:", err);
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      if (data && data.subscription) {
        data.subscription.unsubscribe();
      }
    };
  }, [setSupabaseUser, setUser, setLoading]);

  return <>{children}</>;
}
