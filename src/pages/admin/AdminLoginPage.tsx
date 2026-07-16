import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../store/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Shield, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!supabase) {
        throw new Error("Supabase client non configuré.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Vérifier si l'utilisateur a le rôle admin
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError || profileData?.role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error("Accès refusé. Vous n'avez pas les droits d'administrateur.");
        }

        addToast('success', 'Connexion administrateur réussie');
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (error: any) {
      addToast('error', error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#FFF0F0] rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#FFF0F0] rounded-full blur-3xl -z-10"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center gap-2">
            <Shield className="h-10 w-10 text-accent" />
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-text-primary">Portail Administrateur</h1>
          <p className="mt-2 text-text-secondary font-medium">Accès restreint au personnel autorisé</p>
        </div>

        <Card className="p-8 border-t-4 border-t-accent">
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Email Administrateur"
              type="email"
              placeholder="admin@mercaply.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              iconLeft={<Mail className="h-5 w-5" />}
              required
            />
            
            <div className="space-y-1">
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                iconLeft={<Lock className="h-5 w-5" />}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
                required
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Connexion Sécurisée
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
