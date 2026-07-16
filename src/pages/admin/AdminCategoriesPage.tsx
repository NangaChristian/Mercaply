import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Image as ImageIcon, Save, X, List } from 'lucide-react';
import { Category } from '../../types';
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES } from '../../constants';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le formulaire
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  // Charger les données au montage du composant
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    if (!supabase) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('type', { ascending: true })
      .order('display_order', { ascending: true });
      
    if (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
    } else if (data) {
      setCategories(data);
    }
    
    setLoading(false);
  };

  // Fonction pour uploader une image
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImage(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Vous devez sélectionner une image à uploader.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `category_${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload dans le bucket 'public_content'
      const { error: uploadError } = await supabase.storage
        .from('public_content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique de l'image
      const { data } = supabase.storage.from('public_content').getPublicUrl(filePath);
      
      setCurrentCategory({ ...currentCategory, icon_url: data.publicUrl });
    } catch (error: any) {
      alert('Erreur lors de l\'upload: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Sauvegarder une catégorie
  const saveCategory = async () => {
    if (!supabase) return;
    
    if (!currentCategory.name || !currentCategory.type) {
      alert('Le nom et le type sont obligatoires.');
      return;
    }

    if (currentCategory.id) {
      const { error } = await supabase
        .from('categories')
        .update(currentCategory)
        .eq('id', currentCategory.id);
        
      if (error) alert('Erreur: ' + error.message);
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([{
          ...currentCategory,
          display_order: currentCategory.display_order || categories.length + 1
        }]);
        
      if (error) alert('Erreur: ' + error.message);
    }
    
    setIsEditing(false);
    setCurrentCategory({});
    fetchCategories();
  };

  // Supprimer une catégorie
  
  const syncCategories = async () => {
    if (!supabase || !confirm('Voulez-vous synchroniser les catégories par défaut avec la base de données ?')) return;
    
    try {
      const allCategories = [
        ...PRODUCT_CATEGORIES.map((c, idx) => ({
          name: c.name,
          type: 'product',
          icon_url: c.icon,
          display_order: idx + 1
        })),
        ...SERVICE_CATEGORIES.map((c, idx) => ({
          name: c.name,
          type: 'service',
          icon_url: c.icon,
          display_order: idx + 1
        }))
      ];
      
      for (const cat of allCategories) {
        // Vérifier si elle existe déjà
        const { data: existing } = await supabase.from('categories').select('id').eq('name', cat.name).single();
        if (!existing) {
          await supabase.from('categories').insert([cat]);
        }
      }
      
      alert('Synchronisation terminée avec succès.');
      fetchCategories();
    } catch (error: any) {
      alert('Erreur lors de la synchronisation: ' + error.message);
    }
  };


  const deleteCategory = async (id: string) => {
    if (!supabase || !confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) alert('Erreur: ' + error.message);
    else fetchCategories();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <List className="w-6 h-6" /> Gestion des Catégories
        </h1>
      </div>

      {!isEditing ? (
        <>
          <div className="flex mb-4">
            <button
              onClick={() => { setCurrentCategory({ type: 'product', display_order: categories.length + 1 }); setIsEditing(true); }}
              className="bg-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-accent/90"
            >
              <Plus size={18} /> Ajouter une Catégorie
            </button>
            <button
              onClick={syncCategories}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 ml-2"
            >
              <List size={18} /> Synchroniser
            </button>
          </div>

          
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Icône/Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Chargement...</td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Aucune catégorie trouvée.</td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4">
                        {category.icon_url ? (
                          <img src={category.icon_url} alt={category.name} className="h-10 w-10 object-cover rounded-lg border" />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          category.type === 'product' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {category.type === 'product' ? 'Produit' : 'Service'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{category.display_order}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button onClick={() => { setCurrentCategory(category); setIsEditing(true); }} className="text-blue-600 hover:text-blue-800">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => deleteCategory(category.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow max-w-2xl">
          <h2 className="text-xl font-bold mb-6">{currentCategory.id ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la catégorie *</label>
              <input 
                type="text" 
                value={currentCategory.name || ''} 
                onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-accent focus:border-accent"
                placeholder="Ex: Agriculture"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={currentCategory.type || 'product'}
                  onChange={(e) => setCurrentCategory({...currentCategory, type: e.target.value as 'product' | 'service'})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-accent focus:border-accent"
                >
                  <option value="product">Produit</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                <input 
                  type="number" 
                  value={currentCategory.display_order || 1} 
                  onChange={(e) => setCurrentCategory({...currentCategory, display_order: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-accent focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icône ou Image (URL ou Upload)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={currentCategory.icon_url || ''} 
                  onChange={(e) => setCurrentCategory({...currentCategory, icon_url: e.target.value})}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-accent focus:border-accent"
                  placeholder="https://..."
                />
                <label className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 hover:bg-gray-200 transition-colors">
                  <ImageIcon size={18} /> {uploadingImage ? '...' : 'Upload'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
              {currentCategory.icon_url && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 inline-block">
                  <img src={currentCategory.icon_url} alt="Preview" className="h-20 object-contain rounded" />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button onClick={saveCategory} className="bg-accent text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-accent/90 transition-colors">
                <Save size={18} /> Sauvegarder
              </button>
              <button onClick={() => { setIsEditing(false); setCurrentCategory({}); }} className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
                <X size={18} /> Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
