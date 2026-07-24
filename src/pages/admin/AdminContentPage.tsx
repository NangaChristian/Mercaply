import React, { useState } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import { 
  LayoutTemplate, Image as ImageIcon, Type, Link2, 
  Save, Eye, Plus, Trash2, GripVertical, Settings2
} from 'lucide-react';

export function AdminContentPage() {
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState<'hero' | 'banners' | 'sections'>('hero');

  if (!isAdmin) return null;

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutTemplate className="w-8 h-8 text-accent" />
            Gestion CMS
          </h1>
          <p className="text-slate-500 mt-1">Configurez l'apparence et le contenu de la page d'accueil B2B/B2C.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            <Eye className="w-4 h-4" /> Prévisualiser
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-medium shadow-sm">
            <Save className="w-4 h-4" /> Publier
          </button>
        </div>
      </div>

      <div className="flex bg-white border border-slate-200 p-1 rounded-lg shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'hero' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Hero Section
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'banners' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Bannières Promotionnelles
        </button>
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'sections' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sections Dynamiques
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {activeTab === 'hero' && (
          <div className="space-y-6 max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Configuration du Hero Principal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Type className="w-4 h-4 text-slate-400" /> Titre Principal (H1)
                </label>
                <input 
                  type="text" 
                  defaultValue="La Marketplace B2B & B2C N°1 au Cameroun"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-medium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Type className="w-4 h-4 text-slate-400" /> Sous-titre
                </label>
                <textarea 
                  rows={2}
                  defaultValue="Trouvez les meilleurs fournisseurs, produits et prestataires de services pour votre entreprise."
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" /> Image de fond / Vidéo
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-900">Cliquez ou glissez une image ici</p>
                  <p className="text-xs text-slate-500 mt-1">1920x1080px recommandé (JPG, PNG, WEBP)</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Type className="w-4 h-4 text-slate-400" /> Texte Bouton Primaire
                  </label>
                  <input type="text" defaultValue="Explorer le Catalogue" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-slate-400" /> Lien Bouton Primaire
                  </label>
                  <input type="text" defaultValue="/products" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-lg font-bold text-slate-900">Organisation de la page d'accueil</h2>
              <button className="text-sm font-medium text-accent hover:text-blue-800 flex items-center gap-1">
                <Plus className="w-4 h-4" /> Ajouter une section
              </button>
            </div>
            
            <div className="space-y-3 max-w-4xl">
              {[
                { id: 1, title: 'Catégories Populaires', type: 'Grid 6 colonnes' },
                { id: 2, title: 'Produits Recommandés (IA)', type: 'Carrousel dynamique' },
                { id: 3, title: 'Bannière Promo Mi-Page', type: 'Image pleine largeur' },
                { id: 4, title: 'Services B2B Top Notés', type: 'Grille de cartes' },
                { id: 5, title: 'Made In Cameroun', type: 'Filtre automatique' }
              ].map((section, idx) => (
                <div key={section.id} className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
                  <div className="cursor-grab text-slate-400 hover:text-slate-600">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{section.title}</p>
                    <p className="text-xs text-slate-500">{section.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-accent bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors">
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
