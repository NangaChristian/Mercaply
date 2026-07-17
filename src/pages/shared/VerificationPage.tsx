import { supabase } from '../../lib/supabase';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { uploadFile } from '../../utils/uploadFile';
import { Upload, ShieldCheck, AlertCircle, Clock, FileText, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function VerificationPage() {
  const { user: user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [verification_status, setVerificationStatus] = useState<string>('unverified');
  
  const [files, setFiles] = useState<{
    cniFront: File | null;
    cniBack: File | null;
    companyDoc: File | null;
  }>({ cniFront: null, cniBack: null, companyDoc: null });

  useEffect(() => {
    async function loadStatus() {
      if (!user) return;
      try {
        const { data: authData } = await supabase.auth.getUser();
        const metadata = authData?.user?.user_metadata || {};
        if (metadata.verification_status) {
          setVerificationStatus(metadata.verification_status);
        }
      } catch (err) {
        console.error("Error loading verification status:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStatus();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!files.cniFront || !files.cniBack) {
      alert("Veuillez fournir au minimum le recto et le verso de votre CNI.");
      return;
    }

    setIsUploading(true);
    try {
      const cniFrontUrl = await uploadFile(files.cniFront, `users/${user.uid}/verification/cniFront`, undefined, 'public_content');
      const cniBackUrl = await uploadFile(files.cniBack, `users/${user.uid}/verification/cniBack`, undefined, 'public_content');
      let companyDocUrl = null;
      if (files.companyDoc) {
        companyDocUrl = await uploadFile(files.companyDoc, `users/${user.uid}/verification/companyDoc`, undefined, 'public_content');
      }

      const docRefs = {
        cniFront: cniFrontUrl,
        cniBack: cniBackUrl,
        ...(companyDocUrl && { companyDoc: companyDocUrl })
      };

      await supabase.auth.updateUser({
        data: {
          verification_documents: docRefs,
          verification_status: 'pending'
        }
      });

      setVerificationStatus('pending');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Upload Error:', err);
      alert("Erreur lors de l'envoi des documents.");
    } finally {
      setIsUploading(false);
    }
  };

  const goBackUrl = window.location.pathname.startsWith('/seller') ? '/seller/dashboard' : '/buyer/profile';

  if (isLoading) {
    return <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-accent" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(goBackUrl)}
          className="p-2 bg-surface border border-border-light rounded-xl text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Vérification d'identité</h1>
          <p className="text-text-secondary mt-1">Sécurisez votre compte et augmentez vos limites</p>
        </div>
      </div>

      {verification_status === 'pending' && (
        <div className="bg-warning/10 border border-warning/20 rounded-2xl p-6 mb-8 text-center">
          <Clock className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-bold text-warning-dark mb-2">Documents en cours d'examen</h2>
          <p className="text-warning-dark/80 max-w-md mx-auto">
            Nous avons bien reçu vos documents. Notre équipe les examine manuellement. Vous recevrez une notification d'ici 24h à 48h.
          </p>
        </div>
      )}

      {verification_status === 'verified' && (
        <div className="bg-success/10 border border-success/20 rounded-2xl p-6 mb-8 text-center">
          <ShieldCheck className="h-12 w-12 text-success mx-auto mb-4" />
          <h2 className="text-xl font-bold text-success-dark mb-2">Identité vérifiée</h2>
          <p className="text-success-dark/80 max-w-md mx-auto">
            Félicitations, votre identité a été confirmée ! Vous bénéficiez désormais de toutes les fonctionnalités avancées.
          </p>
        </div>
      )}

      {verification_status === 'rejected' && (
        <div className="bg-danger/10 border border-danger/20 rounded-2xl p-6 mb-8 text-center">
          <AlertCircle className="h-12 w-12 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold text-danger-dark mb-2">Vérification échouée</h2>
          <p className="text-danger-dark/80 max-w-md mx-auto">
            Les documents fournis n'ont pas pu être validés. Assurez-vous qu'ils soient lisibles, valides et à votre nom, puis réessayez.
          </p>
        </div>
      )}

      {(verification_status === 'unverified' || verification_status === 'rejected') && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border-light rounded-3xl p-6 md:p-8 space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              Carte Nationale d'Identité (CNI)
            </h3>
            <p className="text-sm text-text-secondary">Veuillez fournir une photo claire du recto et verso de votre pièce d'identité.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-text-secondary mb-2">Recto de la CNI *</label>
                <div className="border-2 border-dashed border-border-light rounded-2xl p-6 text-center hover:border-accent hover:bg-background transition-colors cursor-pointer relative overflow-hidden group">
                  <input 
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'cniFront')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                  />
                  {files.cniFront ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="w-8 h-8 text-success mb-2" />
                      <span className="text-sm font-medium text-success-dark">{files.cniFront.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-text-tertiary mb-2 group-hover:text-accent transition-colors" />
                      <span className="text-sm font-medium text-text-secondary">Cliquer pour choisir</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-text-secondary mb-2">Verso de la CNI *</label>
                <div className="border-2 border-dashed border-border-light rounded-2xl p-6 text-center hover:border-accent hover:bg-background transition-colors cursor-pointer relative overflow-hidden group">
                  <input 
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'cniBack')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                  />
                  {files.cniBack ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="w-8 h-8 text-success mb-2" />
                      <span className="text-sm font-medium text-success-dark">{files.cniBack.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-text-tertiary mb-2 group-hover:text-accent transition-colors" />
                      <span className="text-sm font-medium text-text-secondary">Cliquer pour choisir</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border-light">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              Documents d'entreprise (Sellers uniquement)
            </h3>
            <p className="text-sm text-text-secondary mb-4">Si vous êtes une entreprise enregistrée, fournissez votre Registre de Commerce ou Numéro d'Identifiant Unique (Optionnel).</p>
            
            <div className="border-2 border-dashed border-border-light rounded-2xl p-6 text-center hover:border-accent hover:bg-background transition-colors cursor-pointer relative overflow-hidden group">
              <input 
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, 'companyDoc')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {files.companyDoc ? (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-8 h-8 text-success mb-2" />
                  <span className="text-sm font-medium text-success-dark">{files.companyDoc.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-text-tertiary mb-2 group-hover:text-accent transition-colors" />
                  <span className="text-sm font-medium text-text-secondary">Cliquer ou glisser le document ici</span>
                  <span className="text-xs text-text-tertiary mt-1">Format PDF, JPG, PNG</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-8">
            <Button type="submit" className="w-full py-4 text-base" isLoading={isUploading} disabled={!files.cniFront || !files.cniBack} variant="primary">
              Soumettre les documents
            </Button>
            <p className="text-xs text-text-tertiary text-center mt-4">
              Vos informations sont cryptées et stockées de manière sécurisée, 
              elles ne seront utilisées que dans le cadre du processus de vérification de sécurité imposé par la loi.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
