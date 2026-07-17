// @ts-nocheck
import { supabase } from '../../lib/supabase';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '../../store/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { CAMEROON_REGIONS, PRODUCT_CATEGORIES } from '../../constants';
import { Store, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

const baseSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  phone: z.string().regex(/^\+237[0-9]{9}$/, 'Format invalide (ex: +237600000000)'),
  region: z.string().min(1, 'Veuillez sélectionner une région'),
});

const sellerSchema = baseSchema.extend({
  storeName: z.string().min(2, 'Le nom de la boutique est requis'),
  storeCategory: z.string().min(1, 'Veuillez sélectionner une catégorie'),
  storeDescription: z.string().min(10, 'Description trop courte'),
  cniNumber: z.string().min(5, 'Numéro CNI/RC requis'),
});

type RegisterFormValues = z.infer<typeof sellerSchema>;

export function RegisterPage() {
  const [role, setRole] = useState<'buyer' | 'seller' | null>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const currentSchema = role === 'seller' && step === 2 ? sellerSchema : baseSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(currentSchema) as any,
  });

  const handleNextStep = async () => {
    const isStep1Valid = await trigger(['email', 'password', 'phone', 'region'] as any);
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const handleGoogleRegister = async () => {
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
      addToast('success', 'Inscription avec Google réussie');
    } catch (error: any) {
      addToast('error', error.message || 'Erreur lors de l\'inscription avec Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    if (!supabase) {
      addToast('error', 'Supabase non configuré');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur lors de la création de l\'utilisateur');

      const userId = authData.user.id;

      // 2. Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: data.email,
            phone: data.phone,
            role: role,
            region: data.region,
            is_verified: false,
          },
        ]);

      if (profileError) throw profileError;

      // 3. If seller, create store
      if (role === 'seller') {
        const { error: storeError } = await supabase
          .from('stores')
          .insert([
            {
              owner_id: userId,
              name: data.storeName,
              description: data.storeDescription,
              region: data.region,
              cni_number: data.cniNumber,
              rating: 0,
              total_sales: 0,
              is_verified: false,
              categories: [data.storeCategory],
            },
          ]);

        if (storeError) throw storeError;
      }

      addToast('success', 'Compte créé avec succès. Vérifiez votre email.');
      navigate('/auth/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      addToast('error', error.message || 'Erreur lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#FFF0F0] rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#FFF0F0] rounded-full blur-3xl -z-10"></div>
        <div className="w-full max-w-2xl relative z-10">
          <div className="text-center mb-12">
            <Link to="/" className="flex items-center justify-center gap-2">
              <img src="/Mercaply black-01.png" alt="Mercaply" className="h-10 object-contain" />
            </Link>
            <h1 className="mt-6 text-2xl font-bold text-text-primary">Rejoignez Mercaply</h1>
            <p className="mt-2 text-text-secondary">Choisissez comment vous souhaitez utiliser la plateforme</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className="p-8 cursor-pointer hover:border-accent hover:ring-1 hover:ring-accent transition-all"
              onClick={() => setRole('buyer')}
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Je suis Acheteur</h2>
              <p className="text-text-secondary">
                Je veux acheter des produits en gros ou au détail auprès de fournisseurs locaux.
              </p>
            </Card>

            <Card
              className="p-8 cursor-pointer hover:border-accent hover:ring-1 hover:ring-accent transition-all"
              onClick={() => setRole('seller')}
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                <Store className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Je suis Vendeur</h2>
              <p className="text-text-secondary">
                Je veux créer ma boutique et vendre mes produits.
              </p>
            </Card>
          </div>
          
          <p className="mt-8 text-center text-sm text-text-secondary">
            Déjà un compte ?{' '}
            <Link to="/auth/login" className="font-medium text-accent hover:text-accent-hover transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#FFF0F0] rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#FFF0F0] rounded-full blur-3xl -z-10"></div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center gap-2">
            <img src="/Mercaply black-01.png" alt="Mercaply" className="h-10 object-contain" />
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-text-primary">
            Inscription {role === 'seller' ? 'Vendeur' : 'Acheteur'}
          </h1>
          {role === 'seller' && (
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-accent' : 'bg-surface-2'}`} />
              <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-accent' : 'bg-surface-2'}`} />
            </div>
          )}
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="votre@email.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label="Mot de passe"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Input
                  label="Téléphone"
                  type="tel"
                  placeholder="+237600000000"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <Select
                  label="Région"
                  error={errors.region?.message}
                  {...register('region')}
                >
                  <option value="">Sélectionnez une région</option>
                  {CAMEROON_REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </Select>

                {role === 'seller' ? (
                  <Button type="button" className="w-full mt-6" onClick={handleNextStep}>
                    Suivant <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
                    Créer mon compte
                  </Button>
                )}
              </div>
            )}

            {step === 2 && role === 'seller' && (
              <div className="space-y-4">
                <Input
                  label="Nom de la boutique"
                  placeholder="Ma Super Boutique"
                  error={errors.storeName?.message}
                  {...register('storeName')}
                />
                <Select
                  label="Catégorie principale"
                  error={errors.storeCategory?.message}
                  {...register('storeCategory')}
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
                <Input
                  label="Numéro CNI ou Registre de Commerce"
                  placeholder="123456789"
                  error={errors.cniNumber?.message}
                  {...register('cniNumber')}
                />
                <div className="w-full">
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Description courte
                  </label>
                  <textarea
                    className="block w-full rounded-md border-transparent bg-surface text-text-primary placeholder-text-tertiary focus:bg-background focus:border-accent focus:ring-1 focus:ring-accent transition-colors p-3"
                    placeholder="Décrivez votre activité..."
                    {...register('storeDescription')}
                  />
                  {errors.storeDescription && <p className="mt-1.5 text-sm text-danger">{errors.storeDescription.message}</p>}
                </div>

                <div className="flex gap-4 mt-6">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                  </Button>
                  <Button type="submit" className="flex-1" isLoading={isLoading}>
                    Créer ma boutique
                  </Button>
                </div>
              </div>
            )}
          </form>

          {step === 1 && (
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
                  onClick={handleGoogleRegister}
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
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => { setRole(null); setStep(1); }}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Changer de type de compte
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
