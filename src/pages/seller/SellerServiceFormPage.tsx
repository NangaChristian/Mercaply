import { db, doc, getDoc, updateDoc, setDoc, addDoc, deleteDoc, collection, serverTimestamp } from '../../lib/supabase-compat';
import { useCategories } from '../../contexts/CategoriesContext';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import {  CAMEROON_REGIONS } from '../../constants';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Service } from '../../types';

export function SellerServiceFormPage() {
  const { productCategories: PRODUCT_CATEGORIES, serviceCategories: SERVICE_CATEGORIES } = useCategories();

  const { id } = useParams();
  const navigate = useNavigate();
  const { user: user } = useAuth();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({
    title: '',
    description: '',
    price: 0,
    priceType: 'fixed',
    category: SERVICE_CATEGORIES[0].id,
    region: CAMEROON_REGIONS[0].id,
    deliveryTime: '',
    isActive: true,
    images: []
  });

  useEffect(() => {
    if (isEditing && id) {
      const fetchService = async () => {
        try {
          const docRef = doc(db, 'services', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFormData(docSnap.data() as Service);
          } else {
            navigate('/seller/services');
          }
        } catch (error) {
          console.error("Error fetching service:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchService();
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const serviceData = {
        ...formData,
        sellerId: user.uid,
        updatedAt: serverTimestamp(),
      };

      if (isEditing && id) {
        await updateDoc(doc(db, 'services', id), serviceData);
      } else {
        await addDoc(collection(db, 'services'), {
          ...serviceData,
          views: 0,
          createdAt: serverTimestamp()
        });
      }
      navigate('/seller/services');
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  if (isLoading) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 text-accent mx-auto" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/seller/services')}
          className="p-2 bg-surface border border-border-light rounded-xl text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">
          {isEditing ? 'Modifier le Service' : 'Nouveau Service'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface border border-border-light rounded-2xl p-6 md:p-8 space-y-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Titre du service</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="ex: Création de site web vitrine"
              className="w-full px-4 py-2.5 bg-background border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Décrivez votre service en détail..."
              className="w-full px-4 py-2.5 bg-background border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Catégorie</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              >
                {SERVICE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Région</label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              >
                {CAMEROON_REGIONS.map(reg => (
                  <option key={reg.id} value={reg.id}>{reg.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Type de prix</label>
              <select
                name="priceType"
                value={formData.priceType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-background border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              >
                <option value="fixed">Fixe</option>
                <option value="hourly">Par heure</option>
                <option value="starting_at">À partir de</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Prix (FCFA)</label>
              <input 
                type="number" 
                name="price"
                value={formData.price || ''}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2.5 bg-background border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Délai estimé</label>
              <input 
                type="text" 
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleChange}
                placeholder="ex: 3 jours"
                className="w-full px-4 py-2.5 bg-background border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 rounded border-border-light text-accent focus:ring-accent/20"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-text-primary">
              Service actif et visible
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-border-light gap-4">
          <button
            type="button"
            onClick={() => navigate('/seller/services')}
            className="px-6 py-2.5 border border-border-light text-text-primary font-medium rounded-xl hover:bg-background transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors flex items-center disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
