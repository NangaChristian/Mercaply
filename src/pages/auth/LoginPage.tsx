// @ts-nocheck
import { supabase } from '../../lib/supabase';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '../../store/useToast';
import { useAuth } from '../../store/useAuth';
import { useEffect } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // MFA States
  const [showMfaVerify, setShowMfaVerify] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  
  useEffect(() => {
    if (user && !authLoading) {
      const defaultFrom = user.role === 'admin' ? '/admin/dashboard' : user.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard';
      const from = location.state?.from?.pathname || defaultFrom;
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, location.state]);

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    if (!supabase) {
      addToast('error', 'Supabase non configuré');
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur de connexion');

      // Check MFA Status
      const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (mfaData?.nextLevel === 'aal2' && mfaData.nextLevel !== mfaData.currentLevel) {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors.totp[0];
        
        if (totpFactor) {
          setFactorId(totpFactor.id);
          setShowMfaVerify(true);
          return; // Stop here and show MFA form
        }
      }

      addToast('success', 'Connexion réussie');
      // Navigation will be handled by useEffect when user is populated in store
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error messages
      if (error.message.includes('Invalid login credentials')) {
        addToast('error', 'Email ou mot de passe incorrect');
      } else if (error.message.includes('Email not confirmed')) {
        addToast('error', 'Veuillez confirmer votre email avant de vous connecter');
      } else {
        addToast('error', error.message || 'Erreur de connexion');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isGoogleLoading || !supabase) return;
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      addToast('success', 'Connexion réussie');
    } catch (error: any) {
      console.error('Google login error:', error);
      addToast('error', error.message || 'Erreur de connexion Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };


  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || mfaCode.length < 6) return;
    
    setIsVerifying(true);
    try {
      const challengeResponse = await supabase.auth.mfa.challenge({ factorId });
      if (challengeResponse.error) throw challengeResponse.error;
      
      const verifyResponse = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeResponse.data.id,
        code: mfaCode
      });
      
      if (verifyResponse.error) throw verifyResponse.error;
      
      addToast('success', 'Connexion réussie');
      // Navigation will be handled by useEffect when user is populated in store
    } catch (error: any) {
      addToast('error', error.message || 'Code MFA invalide');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#FFF0F0] rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#FFF0F0] rounded-full blur-3xl -z-10"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center gap-2">
            <img src="/Mercaply black-01.png" alt="Mercaply" className="h-10 object-contain" />
          </Link>
          <p className="mt-2 text-text-secondary font-medium">Connectez-vous à votre compte</p>
        </div>

        <Card className="p-8">
          {showMfaVerify ? (
            <form onSubmit={handleVerifyMfa} className="space-y-6">
              <div className="text-center mb-6">
                <Lock className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-lg font-bold text-text-primary">Vérification en deux étapes</h3>
                <p className="text-sm text-text-secondary mt-2">
                  Entrez le code à 6 chiffres généré par votre application d'authentification.
                </p>
              </div>
              <Input
                label="Code d'authentification"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="text-center tracking-[0.5em] font-mono text-xl"
              />
              <Button type="submit" className="w-full" isLoading={isVerifying} disabled={mfaCode.length !== 6}>
                Vérifier
              </Button>
              <button 
                type="button" 
                onClick={() => { setShowMfaVerify(false); setMfaCode(''); }}
                className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors mt-4"
              >
                Retour à la connexion
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="votre@email.com"
              iconLeft={<Mail className="h-5 w-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="space-y-1">
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
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
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex justify-end">
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-accent hover:text-accent-hover transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Se connecter
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-light" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-text-secondary">ou continuer avec</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 mr-2 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Google
              </Button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-text-secondary">
            Pas encore de compte ?{' '}
            <Link to="/auth/register" className="font-medium text-accent hover:text-accent-hover transition-colors">
              S'inscrire
            </Link>
          </p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
