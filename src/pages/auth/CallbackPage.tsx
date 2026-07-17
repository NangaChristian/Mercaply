import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export function CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current session after OAuth redirect
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Callback error:', error);
          navigate('/auth/login', { state: { error: 'Authentication failed' } });
          return;
        }

        if (session) {
          // Session established successfully, redirect to home
          navigate('/');
        } else {
          // No session, redirect to login
          navigate('/auth/login');
        }
      } catch (error) {
        console.error('Callback handler error:', error);
        navigate('/auth/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-secondary font-medium">Authentification en cours...</p>
      </div>
    </div>
  );
}
