// @ts-nocheck
import { db, doc, getDoc, updateDoc, setDoc, addDoc, deleteDoc, collection, serverTimestamp } from '../../lib/supabase-compat';
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save, MapPin, Phone, Mail, Globe, Facebook, Instagram, Twitter, Loader2 } from 'lucide-react';
import { CAMEROON_REGIONS } from '../../constants';
import { useAuth } from '../../store/useAuth';
import { uploadFile } from '../../utils/uploadFile';
import { Button } from '../../components/ui/Button';

export function SellerStorePage() {
  const { user: user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [storeName, setStoreName] = useState(user?.displayName || 'Ma Boutique');
  const [description, setDescription] = useState('Description de la boutique');
  const [region, setRegion] = useState('littoral');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [banner, setBanner] = useState('');
  const [logo, setLogo] = useState('');
  const [links, setLinks] = useState({ website: '', facebook: '', instagram: '' });
  
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    async function loadStoreData() {
      if (!user) return;
      try {
        const docRef = doc(db, 'stores', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStoreName(data.storeName || storeName);
          setDescription(data.description || '');
          setRegion(data.region || 'littoral');
          setPhone(data.phone || '');
          setEmail(data.email || email);
          setBanner(data.banner || '');
          setLogo(data.logo || '');
          setLinks(data.links || { website: '', facebook: '', instagram: '' });
        }
      } catch (error) {
        console.error('Error loading store data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoreData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'stores', user.uid), {
        storeName,
        description,
        region,
        phone,
        email,
        banner,
        logo,
        links,
        updatedAt: serverTimestamp()
      }, { merge: true });
      alert('Boutique mise à jour avec succès');
    } catch (error) {
      console.error('Error saving store data:', error);
      alert('Erreur lors de la sauvegarde de la boutique');
    } finally {
      setIsSaving(false);
    }
  };

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingBanner(true);
      const url = await uploadFile(file, `stores/${user?.uid}/banner`);
      setBanner(url);
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Erreur lors du téléchargement de la bannière');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingLogo(true);
      const url = await uploadFile(file, `stores/${user?.uid}/logo`);
      setLogo(url);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Erreur lors du téléchargement du logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Ma boutique</h1>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors flex items-center disabled:opacity-70"
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Save className="h-5 w-5 mr-2" />
          )}
          Enregistrer les modifications
        </button>
      </div>

      {/* Banner & Logo */}
      <div className="bg-background rounded-2xl border border-border-light overflow-hidden shadow-sm">
        <div className="h-48 md:h-64 bg-surface relative group flex items-center justify-center">
          {banner ? (
            <img 
              src={banner} 
              alt="Store Banner" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
             <div className="text-text-tertiary">Aucune bannière</div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={() => bannerInputRef.current?.click()}
              disabled={isUploadingBanner}
              className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-xl font-medium flex items-center hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              {isUploadingBanner ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Camera className="h-5 w-5 mr-2" />
              )}
              {isUploadingBanner ? 'Téléchargement...' : 'Modifier la bannière'}
            </button>
            <input 
              type="file" 
              ref={bannerInputRef} 
              onChange={handleBannerUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>
        
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 sm:-mt-16 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-background bg-surface flex items-center justify-center overflow-hidden">
                {logo ? (
                  <img 
                    src={logo} 
                    alt="Store Logo" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-3xl font-bold text-accent">{storeName.charAt(0)}</div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl cursor-pointer"
                onClick={() => !isUploadingLogo && logoInputRef.current?.click()}
              >
                {isUploadingLogo ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </div>
              <input 
                type="file" 
                ref={logoInputRef} 
                onChange={handleLogoUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-tertiary">Aperçu de votre profil public</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informations principales */}
            <div className="space-y-5">
              <h3 className="font-bold text-text-primary text-lg border-b border-border-light pb-2">Informations principales</h3>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Nom de la boutique</label>
                <input 
                  type="text" 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Région principale</label>
                <select 
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  {CAMEROON_REGIONS.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contacts & Réseaux */}
            <div className="space-y-5">
              <h3 className="font-bold text-text-primary text-lg border-b border-border-light pb-2">Contacts & Réseaux sociaux</h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                  <input 
                    type="url" 
                    placeholder="Site web (optionnel)"
                    value={links.website}
                    onChange={(e) => setLinks({...links, website: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#1877F2]" />
                  <input 
                    type="url" 
                    placeholder="Lien page Facebook"
                    value={links.facebook}
                    onChange={(e) => setLinks({...links, facebook: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#E4405F]" />
                  <input 
                    type="url" 
                    placeholder="Lien profil Instagram"
                    value={links.instagram}
                    onChange={(e) => setLinks({...links, instagram: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
