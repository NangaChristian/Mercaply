import { db, doc, getDoc, updateDoc, setDoc, addDoc, deleteDoc, collection, serverTimestamp } from '../../lib/supabase-compat';
import { useCategories } from '../../contexts/CategoriesContext';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, UploadCloud, Plus, Trash2, Info, Save, CheckCircle2, Loader2 } from 'lucide-react';
import {  CAMEROON_REGIONS } from '../../constants';
import { cn } from '../../utils/cn';
import { useAuth } from '../../store/useAuth';
import { uploadFile } from '../../utils/uploadFile';
import { ProductVariation } from '../../types';

export function SellerProductFormPage() {
  const { productCategories: PRODUCT_CATEGORIES, serviceCategories: SERVICE_CATEGORIES } = useCategories();

  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user: user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('kg');
  const [minOrder, setMinOrder] = useState('1');
  const [images, setImages] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!isEditing || !id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || '');
          setCategory(data.category || '');
          setShortDesc(data.description || '');
          setPrice(data.price?.toString() || '');
          setStock(data.stock?.toString() || '');
          setUnit(data.unit || 'kg');
          setMinOrder(data.minOrder?.toString() || '1');
          setImages(data.images || []);
          setSelectedRegions(data.region ? [data.region] : []); // simplified
          setVariations(data.variations || []);
        }
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id, isEditing]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      setIsUploadingImage(true);
      const url = await uploadFile(file, `products/${user.uid}`);
      setImages([...images, url]);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors du téléchargement de l\'image');
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) {
         imageInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (status: 'draft' | 'active') => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      const productData = {
        title,
        category,
        description: shortDesc,
        price: Number(price),
        stock: Number(stock),
        unit,
        minOrder: Number(minOrder),
        images,
        variations,
        region: selectedRegions[0] || 'Littoral', // simplify for now
        status,
        sellerId: user.uid,
        updatedAt: new Date().toISOString(),
      };

      if (isEditing && id) {
        await updateDoc(doc(db, 'products', id), productData);
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: new Date().toISOString(),
          rating: 0,
          verified: false,
        });
      }
      navigate('/seller/products');
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Erreur lors de la sauvegarde du produit.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/seller/products')}
            className="p-2 text-text-secondary hover:bg-surface rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-text-primary">
            {isEditing ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => handleSave('draft')} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" /> Brouillon
          </Button>
          <Button variant="primary" onClick={() => handleSave('active')} isLoading={isSaving}>
            <CheckCircle2 className="h-4 w-4 mr-2" /> Publier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Informations de base */}
          <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text-primary mb-6">Informations de base</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Titre du produit <span className="text-danger">*</span>
                </label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  placeholder="Ex: Tomates fraîches de l'Ouest"
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-text-tertiary">{title.length}/120</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Catégorie <span className="text-danger">*</span>
                </label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Description courte <span className="text-danger">*</span>
                </label>
                <textarea 
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="Résumez les points forts de votre produit..."
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-text-tertiary">{shortDesc.length}/300</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Variations */}
          <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text-primary mb-6">Variations du produit</h2>
            <p className="text-sm text-text-secondary mb-4">
              Ajoutez des variations si le produit a plusieurs tailles, couleurs, ou autres options.
            </p>
            
            <div className="space-y-4 mb-4">
              {variations.map((variation, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-surface p-4 rounded-xl border border-border-light">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Nom de la variation (ex: Taille)
                    </label>
                    <input 
                      type="text" 
                      value={variation.name}
                      onChange={(e) => {
                        const newVars = [...variations];
                        newVars[index].name = e.target.value;
                        setVariations(newVars);
                      }}
                      className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                  </div>
                  <div className="flex-[2]">
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Options (séparées par une virgule)
                    </label>
                    <input 
                      type="text" 
                      value={variation.options.join(', ')}
                      onChange={(e) => {
                        const newVars = [...variations];
                        newVars[index].options = e.target.value.split(',').map(o => o.trim()).filter(o => o);
                        setVariations(newVars);
                      }}
                      placeholder="S, M, L, XL"
                      className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                  </div>
                  <button 
                    onClick={() => setVariations(variations.filter((_, i) => i !== index))}
                    className="p-2 mt-0 sm:mt-5 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setVariations([...variations, { name: '', options: [] }])}
              className="px-4 py-2 text-sm text-accent font-medium rounded-xl hover:bg-accent/10 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une variation
            </button>
          </div>

          {/* Section 3: Images */}
          <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-text-primary">Images du produit</h2>
              <span className="text-sm text-text-tertiary">{images.length}/8 images</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {images.map((img, index) => (
                <div key={index} className="aspect-square rounded-xl border border-border-light overflow-hidden relative group">
                  <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                      className="p-2 bg-danger text-white rounded-full hover:bg-danger-hover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-md">
                      Principale
                    </div>
                  )}
                </div>
              ))}
              
              {images.length < 8 && (
                <button 
                  onClick={() => !isUploadingImage && imageInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="aspect-square rounded-xl border-2 border-dashed border-border-light flex flex-col items-center justify-center text-text-tertiary hover:border-accent hover:text-accent transition-colors bg-surface/50 disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <Loader2 className="h-8 w-8 mb-2 animate-spin" />
                  ) : (
                    <UploadCloud className="h-8 w-8 mb-2" />
                  )}
                  <span className="text-xs font-medium">{isUploadingImage ? '...' : 'Ajouter'}</span>
                </button>
              )}
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <p className="text-xs text-text-tertiary flex items-center">
              <Info className="h-3 w-3 mr-1" /> Recommandé : 800x800px, fond blanc, max 5MB.
            </p>
          </div>

          {/* Section 4: Prix & Stock */}
          <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text-primary mb-6">Prix et Inventaire</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Prix unitaire (FCFA) <span className="text-danger">*</span>
                </label>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Unité de vente <span className="text-danger">*</span>
                </label>
                <select 
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="kg">Kilogramme (kg)</option>
                  <option value="piece">Pièce</option>
                  <option value="carton">Carton</option>
                  <option value="sac">Sac</option>
                  <option value="litre">Litre (L)</option>
                  <option value="tonne">Tonne</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Quantité en stock <span className="text-danger">*</span>
                </label>
                <input 
                  type="number" 
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Commande minimum
                </label>
                <input 
                  type="number" 
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (Right Column) */}
        <div className="space-y-6">
          
          {/* Section 5: Livraison */}
          <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text-primary mb-6">Livraison</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Régions desservies
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {CAMEROON_REGIONS.map(region => (
                    <label key={region.id} className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedRegions.includes(region.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedRegions([...selectedRegions, region.id]);
                          else setSelectedRegions(selectedRegions.filter(id => id !== region.id));
                        }}
                        className="rounded border-border-light text-accent focus:ring-accent mr-3"
                      />
                      <span className="text-sm text-text-primary">{region.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Délai de préparation (jours)
                </label>
                <input 
                  type="number" 
                  placeholder="Ex: 2"
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Section 6: SEO & Visibilité */}
          <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text-primary mb-6">Visibilité</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Mots-clés (Tags)
                </label>
                <input 
                  type="text" 
                  placeholder="Séparés par des virgules"
                  className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
