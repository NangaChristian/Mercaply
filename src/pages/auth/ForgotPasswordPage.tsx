// @ts-nocheck
import { supabase } from '../../lib/supabase';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '../../store/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setIsSubmitted(true);
    } catch (error: any) {
      addToast('error', error.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center">
            <img src="/Mercaply black-01.png" alt="Mercaply" className="h-10 object-contain" />
          </Link>
        </div>

        <Card className="p-8">
          {!isSubmitted ? (
            <>
              <h1 className="text-xl font-bold text-text-primary mb-2 text-center">Mot de passe oublié</h1>
              <p className="text-text-secondary text-sm text-center mb-6">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Email"
                  type="email"
                  placeholder="votre@email.com"
                  iconLeft={<Mail className="h-5 w-5" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Envoyer le lien
                </Button>
              </form>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Email envoyé !</h2>
              <p className="text-text-secondary text-sm mb-8">
                Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.
              </p>
            </motion.div>
          )}

          <div className="mt-6 text-center">
            <Link to="/auth/login" className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la connexion
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
