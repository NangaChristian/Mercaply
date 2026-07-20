import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/useAuth';
import { useToast } from '../../store/useToast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { QRCodeSVG } from 'qrcode.react';

export function MfaSetup() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [mfaStatus, setMfaStatus] = useState<'loading' | 'unverified' | 'verified'>('loading');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      const totpFactors = data.totp || [];
      const verifiedFactor = totpFactors.find(f => f.status === 'verified');
      
      if (verifiedFactor) {
        setMfaStatus('verified');
      } else {
        setMfaStatus('unverified');
      }
    } catch (err) {
      console.error('Error checking MFA status:', err);
    }
  };

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });
      if (error) throw error;
      
      setFactorId(data.id);
      setQrCodeUrl(data.totp.qr_code);
    } catch (err: any) {
      addToast('error', err.message || 'Erreur lors de la configuration de la 2FA');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleVerify = async () => {
    if (!factorId || !verifyCode) return;
    setIsVerifying(true);
    
    try {
      const challengeResponse = await supabase.auth.mfa.challenge({ factorId });
      if (challengeResponse.error) throw challengeResponse.error;
      
      const verifyResponse = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeResponse.data.id,
        code: verifyCode
      });
      
      if (verifyResponse.error) throw verifyResponse.error;
      
      addToast('success', 'Authentification à deux facteurs activée avec succès !');
      setMfaStatus('verified');
      setFactorId(null);
      setQrCodeUrl(null);
      setVerifyCode('');
    } catch (err: any) {
      addToast('error', err.message || 'Code de vérification invalide');
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleUnenroll = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      const totpFactors = data.totp || [];
      const verifiedFactor = totpFactors.find(f => f.status === 'verified');
      
      if (verifiedFactor) {
        const unenrollRes = await supabase.auth.mfa.unenroll({ factorId: verifiedFactor.id });
        if (unenrollRes.error) throw unenrollRes.error;
        addToast('success', 'Authentification à deux facteurs désactivée.');
        setMfaStatus('unverified');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Erreur lors de la désactivation');
    }
  };

  if (mfaStatus === 'loading') {
    return <div className="text-sm text-text-secondary animate-pulse">Chargement...</div>;
  }

  if (mfaStatus === 'verified') {
    return (
      <div className="bg-background border border-border-light rounded-xl p-6">
        <h3 className="text-lg font-bold text-text-primary mb-2">Authentification à deux facteurs (2FA)</h3>
        <div className="flex items-center text-success mb-4 text-sm font-medium">
          <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
          La 2FA est activée sur votre compte
        </div>
        <p className="text-sm text-text-secondary mb-4">
          Votre compte est sécurisé. Vous devrez entrer un code de votre application d'authentification lors de la connexion.
        </p>
        <Button variant="outline" onClick={handleUnenroll} className="text-error border-error/20 hover:bg-error/10">
          Désactiver la 2FA
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border-light rounded-xl p-6">
      <h3 className="text-lg font-bold text-text-primary mb-2">Authentification à deux facteurs (2FA)</h3>
      <p className="text-sm text-text-secondary mb-4">
        Ajoutez une couche de sécurité supplémentaire à votre compte en activant l'authentification à deux facteurs avec une application comme Google Authenticator ou Authy.
      </p>
      
      {!qrCodeUrl ? (
        <Button onClick={handleEnroll} isLoading={isEnrolling}>
          Configurer la 2FA
        </Button>
      ) : (
        <div className="space-y-6 mt-6 p-4 border border-border-light rounded-lg bg-surface">
          <div>
            <h4 className="font-medium text-text-primary text-sm mb-2">1. Scannez le code QR</h4>
            <p className="text-xs text-text-secondary mb-4">Ouvrez votre application d'authentification et scannez ce code QR.</p>
            <div className="bg-white p-4 rounded-lg inline-block">
              <QRCodeSVG value={qrCodeUrl} size={150} />
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-text-primary text-sm mb-2">2. Entrez le code</h4>
            <p className="text-xs text-text-secondary mb-3">Entrez le code à 6 chiffres généré par votre application.</p>
            <div className="flex gap-3">
              <Input
                placeholder="123456"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                maxLength={6}
                className="max-w-[150px] text-center tracking-widest font-mono"
              />
              <Button onClick={handleVerify} isLoading={isVerifying} disabled={verifyCode.length < 6}>
                Vérifier
              </Button>
              <Button variant="outline" onClick={() => { setQrCodeUrl(null); setFactorId(null); }}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
