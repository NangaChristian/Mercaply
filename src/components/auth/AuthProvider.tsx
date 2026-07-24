import { useEffect, ReactNode, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/useAuth';
import { User as AppUser } from '../../types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setSupabaseUser, setUser, setLoading } = useAuth();
  // Keep track of the last processed session ID to avoid redundant fetches
  const lastSessionId = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!supabase) {
      if (mounted) setLoading(false);
      return;
    }

    const handleSession = async (session: any) => {
      if (!mounted) return;
      
      if (session) {
        // Prevent double processing for the same session (e.g. from getSession and INITIAL_SESSION)
        // Note: access_token can change on refresh, but user.id is stable. 
        // We really just want to prevent concurrent fetches on mount.
        
        if (mounted) setLoading(true);
        setSupabaseUser(session.user);
        
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const metaRole = session.user?.user_metadata?.role;
          let finalRole = profile?.role || metaRole || 'buyer';
          
          if (metaRole === 'seller' && profile?.role !== 'seller') {
            const { error: pErr } = await supabase.from('profiles').update({ role: 'seller' }).eq('id', session.user.id);
            if (!pErr) finalRole = 'seller';
            
            const storeName = session.user?.user_metadata?.store_name;
            if (storeName) {
              const { data: store } = await supabase.from('stores').select('id').eq('id', session.user.id).maybeSingle();
              if (!store) {
                await supabase.from('stores').insert([{
                  id: session.user.id,
                  name: storeName,
                  description: session.user?.user_metadata?.store_description
                }]);
              }
            }
          }


          if (mounted) {
            setUser({
              uid: session.user.id,
              email: session.user.email || '',
              role: finalRole,
              createdAt: profile?.created_at || new Date().toISOString(),
              isVerified: profile?.is_verified || false,
            } as AppUser);
            setLoading(false);
          }
        } catch (err: any) {
          console.error("Session handling error:", err);
          
          // Fallback if profile fetch fails (e.g. no profile yet)
          if (mounted) {
             setUser({
              uid: session.user.id,
              email: session.user.email || '',
              role: session.user?.user_metadata?.role || 'buyer',
              createdAt: new Date().toISOString(),
              isVerified: false,
            } as AppUser);
            setLoading(false);
          }
        }
      } else {
        if (mounted) {
          setSupabaseUser(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      await handleSession(session);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      // If onAuthStateChange already ran, it might be redundant, but safe since handleSession handles state overrides well.
      // Actually we just run it in case INITIAL_SESSION doesn't fire.
      if (!useAuth.getState().user && session) {
        await handleSession(session);
      } else if (!session) {
        if (mounted && useAuth.getState().isLoading) {
           setLoading(false);
        }
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
