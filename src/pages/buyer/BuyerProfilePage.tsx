// @ts-nocheck
import { supabase } from '../../lib/supabase';
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { Camera, ShieldCheck, AlertCircle, Save, Lock, Bell, Loader2 } from 'lucide-react';
import { CAMEROON_REGIONS } from '../../constants';
import { cn } from '../../utils/cn';
import { uploadFile } from '../../utils/uploadFile';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../store/useToast';
import { updateUserProfile } from '../../lib/profileUtils';

export function BuyerProfilePage() {
  const { user: user } = useAuth();
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const names = ['User'];

  const [formData, setFormData] = useState({
    firstName: names[0] || '',
    lastName: names.slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    region: 'lt',
    avatarUrl: ''
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailPromos: false,
    smsDelivery: true,
  });

  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      try {
        const { data: authData } = await supabase.auth.getUser();
        const metadata = authData?.user?.user_metadata || {};

        const { data } = await supabase.from('profiles').select('*').eq('id', user.uid).single();
        
        if (data) {
          setFormData(prev => ({
            ...prev,
            firstName: data.first_name || metadata.first_name || prev.firstName,
            lastName: data.last_name || metadata.last_name || prev.lastName,
            phone: metadata.phone || '',
            region: metadata.region || 'lt',
            avatarUrl: data.avatar_url || metadata.avatar_url || prev.avatarUrl
          }));
          if (metadata.notifications) {
            setNotifications(metadata.notifications);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUserData();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      setIsUploadingAvatar(true);
      const url = await uploadFile(file, `users/${user.uid}/avatar`);
      setFormData({ ...formData, avatarUrl: url });
      
      // Update in database immediately
      await updateUserProfile(user.uid, { avatarUrl: url });
      
      addToast('success', 'Avatar mis à jour avec succès');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      addToast('error', 'Erreur lors du téléchargement de l\'avatar');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        region: formData.region,
        avatarUrl: formData.avatarUrl,
        notifications
      });
      addToast('success', 'Profil mis à jour');
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('error', 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Mon profil</h1>
        <p className="text-text-secondary mt-1">Gérez vos informations personnelles et vos préférences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-background rounded-2xl border border-border-light p-6 flex flex-col items-center text-center shadow-sm">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full bg-surface border-4 border-background shadow-sm overflow-hidden flex items-center justify-center text-4xl text-text-tertiary">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <>{formData.firstName.charAt(0)}{formData.lastName.charAt(0)}</>
                )}
              </div>
              <button 
                onClick={() => !isUploadingAvatar && avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 p-2 bg-accent text-white rounded-full shadow-md hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <h2 className="font-bold text-text-primary text-lg">{formData.firstName} {formData.lastName}</h2>
            <p className="text-sm text-text-secondary">{formData.email}</p>
          </div>

          <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-text-primary flex items-center">
              <Lock className="h-5 w-5 mr-2 text-text-tertiary" />
              Sécurité
            </h3>
            <button className="w-full py-2.5 px-4 bg-surface text-text-primary text-sm font-medium rounded-xl hover:bg-border-light transition-colors text-left">
              Changer le mot de passe
            </button>
            <button className="w-full py-2.5 px-4 bg-surface text-text-primary text-sm font-medium rounded-xl hover:bg-border-light transition-colors text-left">
              Activer l'A2F
            </button>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm">
            <h2 className="font-bold text-text-primary mb-6">Informations personnelles</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Prénom</label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Nom</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Adresse Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-surface-2 border border-border-light rounded-xl text-sm text-text-tertiary cursor-not-allowed"
                />
                <p className="text-xs text-text-tertiary mt-1">L'adresse email ne peut pas être modifiée.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Téléphone</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Région principale</label>
                  <select 
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                    className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  >
                    {CAMEROON_REGIONS.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center px-6 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-70"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>

          {/* Notifications Preferences */}
          <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm">
            <h2 className="font-bold text-text-primary mb-6 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-text-tertiary" />
              Préférences de notification
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-sm font-medium text-text-primary">Mises à jour de commande (Email)</p>
                  <p className="text-xs text-text-secondary">Recevez des emails sur l'état de vos commandes.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifications.emailOrders} onChange={(e) => setNotifications({...notifications, emailOrders: e.target.checked})} />
                  <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                </div>
              </label>
              
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-sm font-medium text-text-primary">Promotions et offres (Email)</p>
                  <p className="text-xs text-text-secondary">Recevez nos meilleures offres et nouveautés.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifications.emailPromos} onChange={(e) => setNotifications({...notifications, emailPromos: e.target.checked})} />
                  <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-sm font-medium text-text-primary">Alertes de livraison (SMS)</p>
                  <p className="text-xs text-text-secondary">Soyez notifié par SMS le jour de la livraison.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={notifications.smsDelivery} onChange={(e) => setNotifications({...notifications, smsDelivery: e.target.checked})} />
                  <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
