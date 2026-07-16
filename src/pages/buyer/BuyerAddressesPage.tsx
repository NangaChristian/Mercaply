// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { CAMEROON_REGIONS } from '../../constants';
import { cn } from '../../utils/cn';
import { useAuth } from '../../store/useAuth';
import { supabase } from '../../lib/supabase';

// Initial empty state
const initialAddresses: any[] = [];

export function BuyerAddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>(initialAddresses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    region: 'lt',
    city: '',
    neighborhood: '',
    details: '',
    phone: '',
    isDefault: false
  });

  useEffect(() => {
    async function loadAddresses() {
      if (!user) return;
      try {
        
        const { data } = await supabase.from('profiles').select('addresses').eq('id', user.uid).single();
        if (data && data.addresses) {
          setAddresses(data.addresses);
        }
      } catch (err) {
        console.error("Error loading addresses:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAddresses();
  }, [user]);

  const saveToFirebase = async (newAddresses: any[]) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: newAddresses
      });
    } catch (err) {
      console.error("Error saving addresses:", err);
      alert("Erreur lors de la sauvegarde des adresses");
    }
  };

  const handleOpenForm = (address?: typeof initialAddresses[0]) => {
    if (address) {
      setFormData(address);
      setEditingId(address.id);
    } else {
      setFormData({
        name: '',
        region: 'lt',
        city: '',
        neighborhood: '',
        details: '',
        phone: '',
        isDefault: addresses.length === 0
      });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    let newAddresses = [...addresses];

    // If new address is set as default, remove default from others
    if (formData.isDefault) {
      newAddresses = newAddresses.map(a => ({ ...a, isDefault: false }));
    }

    if (editingId) {
      // Update
      newAddresses = newAddresses.map(a => a.id === editingId ? { ...formData, id: editingId } : a);
    } else {
      // Create
      newAddresses.push({ ...formData, id: Date.now().toString() });
    }

    setAddresses(newAddresses);
    await saveToFirebase(newAddresses);
    setIsSaving(false);
    handleCloseForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      const newAddresses = addresses.filter(a => a.id !== id);
      setAddresses(newAddresses);
      await saveToFirebase(newAddresses);
    }
  };

  const handleSetDefault = async (id: string) => {
    const newAddresses = addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    setAddresses(newAddresses);
    await saveToFirebase(newAddresses);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-text-tertiary animate-pulse">Chargement...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mes adresses</h1>
          <p className="text-text-secondary mt-1">Gérez vos adresses de livraison pour passer commande plus rapidement.</p>
        </div>
        
        {!isFormOpen && (
          <button 
            onClick={() => handleOpenForm()}
            className="flex items-center px-4 py-2 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle adresse
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 className="font-bold text-lg text-text-primary mb-6">
            {editingId ? 'Modifier l\'adresse' : 'Ajouter une adresse'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Nom de l'adresse (ex: Domicile)</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Téléphone de contact</label>
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Région</label>
                <select 
                  required
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                >
                  {CAMEROON_REGIONS.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Ville</label>
                <input 
                  type="text" 
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Quartier</label>
                <input 
                  type="text" 
                  required
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Détails (Rue, Bâtiment...)</label>
                <input 
                  type="text" 
                  required
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                  disabled={addresses.length === 0 || (editingId && addresses.find(a => a.id === editingId)?.isDefault)}
                  className="w-4 h-4 text-accent border-border-light rounded focus:ring-accent"
                />
                <span className={cn(
                  "ml-2 text-sm transition-colors",
                  (addresses.length === 0 || (editingId && addresses.find(a => a.id === editingId)?.isDefault)) 
                    ? "text-text-tertiary" 
                    : "text-text-secondary group-hover:text-text-primary"
                )}>
                  Définir comme adresse par défaut
                </span>
              </label>
            </div>

            <div className="pt-6 flex gap-3 justify-end border-t border-border-light">
              <button 
                type="button"
                onClick={handleCloseForm}
                className="px-6 py-2.5 bg-surface text-text-primary font-medium rounded-xl hover:bg-border-light transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors flex items-center disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border-light p-10 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-text-tertiary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Aucune adresse</h2>
          <p className="text-text-secondary mb-6 max-w-sm">Vous n'avez pas encore enregistré d'adresse de livraison.</p>
          <button 
            onClick={() => handleOpenForm()}
            className="px-6 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter une adresse
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(address => (
            <div 
              key={address.id} 
              className={cn(
                "bg-background rounded-2xl border p-6 shadow-sm flex flex-col transition-colors",
                address.isDefault ? "border-accent ring-1 ring-accent" : "border-border-light hover:border-text-tertiary"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className={cn("h-5 w-5", address.isDefault ? "text-accent" : "text-text-tertiary")} />
                  <h3 className="font-bold text-text-primary">{address.name}</h3>
                  {address.isDefault && (
                    <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-0.5 rounded-full">
                      Défaut
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenForm(address)}
                    className="p-1.5 text-text-secondary hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(address.id)}
                    disabled={address.isDefault}
                    className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-secondary"
                    title={address.isDefault ? "Impossible de supprimer l'adresse par défaut" : "Supprimer"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-sm text-text-secondary flex-1">
                <p>{address.details}</p>
                <p>{address.neighborhood}, {address.city}</p>
                <p>{CAMEROON_REGIONS.find(r => r.id === address.region)?.name}</p>
                <p className="pt-2 font-medium text-text-primary">{address.phone}</p>
              </div>

              {!address.isDefault && (
                <div className="mt-6 pt-4 border-t border-border-light">
                  <button 
                    onClick={() => handleSetDefault(address.id)}
                    className="text-sm font-medium text-accent hover:underline flex items-center"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Définir par défaut
                  </button>
                </div>
              )}
            </div>
          ))}

          {addresses.length === 0 && (
            <div className="col-span-full text-center py-12 bg-background rounded-2xl border border-border-light">
              <MapPin className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">Aucune adresse</h3>
              <p className="text-text-secondary mb-6">Vous n'avez pas encore enregistré d'adresse de livraison.</p>
              <button 
                onClick={() => handleOpenForm()}
                className="inline-flex items-center px-4 py-2 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une adresse
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
