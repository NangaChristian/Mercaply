import { db, doc, getDoc, updateDoc, setDoc, addDoc, deleteDoc, collection, serverTimestamp } from '../../lib/supabase-compat';
import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, CreditCard, User, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { Button } from '../../components/ui/Button';

export function SellerSettingsPage() {
  const { user: user } = useAuth();
  const [verification_status, setVerificationStatus] = useState<string>('unverified');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cniNumber: '',
    rcNumber: '',
    returnPolicy: "Retours acceptés sous 7 jours si le produit n'a pas été ouvert.",
    warrantyPolicy: "Garantie de 6 mois sur les défauts de fabrication."
  });

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const uDoc = await getDoc(doc(db, 'users', user.uid));
        const sDoc = await getDoc(doc(db, 'stores', user.uid));
        
        const ud = uDoc.exists() ? uDoc.data() : {};
        const sd = sDoc.exists() ? sDoc.data() : {};

        if (ud.verification_status) setVerificationStatus(ud.verification_status);
        
        setFormData({
          firstName: ud.firstName || '',
          lastName: ud.lastName || '',
          cniNumber: ud.cniNumber || '',
          rcNumber: ud.rcNumber || '',
          returnPolicy: sd.returnPolicy || "Retours acceptés sous 7 jours si le produit n'a pas été ouvert.",
          warrantyPolicy: sd.warrantyPolicy || "Garantie de 6 mois sur les défauts de fabrication."
        });
      } catch (err) {
        console.error("Error loading verification status:", err);
      }
    }
    loadData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        cniNumber: formData.cniNumber,
        rcNumber: formData.rcNumber
      }, { merge: true });

      await setDoc(doc(db, 'stores', user.uid), {
        returnPolicy: formData.returnPolicy,
        warrantyPolicy: formData.warrantyPolicy
      }, { merge: true });

      alert('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Paramètres de la boutique</h1>
        <Button onClick={handleSave} variant="primary" isLoading={isSaving}>
          <Save className="h-5 w-5 mr-2" /> Enregistrer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center px-4 py-3 bg-accent/10 text-accent font-medium rounded-xl transition-colors">
            <User className="h-5 w-5 mr-3" /> Profil vendeur
          </button>
          <button className="w-full flex items-center px-4 py-3 text-text-secondary hover:bg-surface hover:text-text-primary font-medium rounded-xl transition-colors">
            <CreditCard className="h-5 w-5 mr-3" /> Méthodes de paiement
          </button>
          <button className="w-full flex items-center px-4 py-3 text-text-secondary hover:bg-surface hover:text-text-primary font-medium rounded-xl transition-colors">
            <Bell className="h-5 w-5 mr-3" /> Notifications
          </button>
          <button className="w-full flex items-center px-4 py-3 text-text-secondary hover:bg-surface hover:text-text-primary font-medium rounded-xl transition-colors">
            <Shield className="h-5 w-5 mr-3" /> Sécurité
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">

          {/* Verification Banner */}
          {verification_status === 'unverified' && (
            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-warning flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-warning-dark">Vérification de la boutique requise</h3>
                  <p className="text-sm text-warning-dark/80 mt-1 max-w-lg">
                    Pour vendre sur la plateforme et recevoir des paiements, vous devez fournir vos documents d'identité et les informations légales de votre entreprise.
                  </p>
                </div>
              </div>
              <Link to="/seller/verification" className="whitespace-nowrap px-4 py-2 bg-warning text-white font-medium rounded-xl hover:bg-warning-dark transition-colors">
                Soumettre mes documents
              </Link>
            </div>
          )}

          {verification_status === 'pending' && (
            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 flex items-center gap-4">
              <Shield className="h-6 w-6 text-accent flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-text-primary">Documents en cours d'examen</h3>
                <p className="text-sm text-text-secondary mt-1">Vos documents sont en cours de validation par notre équipe.</p>
              </div>
            </div>
          )}

          {verification_status === 'verified' && (
             <div className="bg-success/10 border border-success/20 rounded-2xl p-6 flex items-center gap-4">
              <ShieldCheck className="h-6 w-6 text-success flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-success-dark">Boutique vérifiée</h3>
                <p className="text-sm text-success-dark/80 mt-1">Vos documents ont été validés avec succès.</p>
              </div>
            </div>
          )}

          <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text-primary mb-6">Informations du représentant légal</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Nom</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="ex: Dupont" 
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Prénom</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="ex: Jean" 
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" 
                />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Numéro de CNI / Passeport</label>
                <input 
                  type="text" 
                  name="cniNumber"
                  value={formData.cniNumber}
                  onChange={handleChange}
                  placeholder="ex: 123456789" 
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Numéro de Registre de Commerce (Optionnel)</label>
                <input 
                  type="text" 
                  name="rcNumber"
                  value={formData.rcNumber}
                  onChange={handleChange}
                  placeholder="RC/DLA/2026/B/1234" 
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" 
                />
              </div>
            </div>
          </div>

          <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text-primary mb-6">Politiques de la boutique</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Politique de retour</label>
                <textarea 
                  rows={3} 
                  name="returnPolicy"
                  value={formData.returnPolicy}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Conditions de garantie</label>
                <textarea 
                  rows={3} 
                  name="warrantyPolicy"
                  value={formData.warrantyPolicy}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
