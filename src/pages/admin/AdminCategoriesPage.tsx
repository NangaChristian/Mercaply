import React, { useState } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import { 
  Layers, Plus, Search, Edit3, Trash2, GripVertical, Image as ImageIcon, 
  FolderTree, Package, Briefcase, Settings, Save, ChevronRight
} from 'lucide-react';

export function AdminCategoriesPage() {
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');

  if (!isAdmin) return null;

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-8 h-8 text-accent" />
            Taxonomie & Catégories
          </h1>
          <p className="text-slate-500 mt-1">Structurez l'arborescence des produits et services du catalogue.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-medium shadow-sm">
          <Plus className="w-4 h-4" /> Créer une Catégorie Racine
        </button>
      </div>

      <div className="flex bg-white border border-slate-200 p-1 rounded-lg shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'products' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" /> Produits
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'services' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Services
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-250px)] min-h-[500px]">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
           <div className="relative max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Chercher une catégorie..." 
               className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
             />
           </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Tree View */}
          <div className="w-1/2 border-r border-slate-200 overflow-y-auto p-4 custom-scrollbar">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Arborescence</h3>
            
            <div className="space-y-2">
              {/* Category Node */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-colors cursor-pointer border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-accent">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Électronique & High-Tech</p>
                      <p className="text-xs text-slate-500">/electronique (450 produits)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Child Nodes */}
              <div className="pl-8 space-y-2 relative before:absolute before:left-[19px] before:top-0 before:bottom-4 before:w-px before:bg-slate-200">
                {[
                  'Smartphones & Tablettes', 
                  'Ordinateurs & PC', 
                  'Accessoires'
                ].map((child, i) => (
                  <div key={i} className="relative flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 group cursor-pointer">
                    <div className="absolute left-[-17px] top-1/2 w-4 h-px bg-slate-200"></div>
                    <FolderTree className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{child}</span>
                  </div>
                ))}
                
                <button className="relative flex items-center gap-2 p-1 mt-1 ml-1 text-xs font-medium text-accent hover:text-blue-800">
                  <Plus className="w-3 h-3" /> Ajouter une sous-catégorie
                </button>
              </div>
            </div>
          </div>

          {/* Edit Panel */}
          <div className="w-1/2 bg-slate-50 p-6 overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-6">Édition : Électronique & High-Tech</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la catégorie</label>
                <input type="text" defaultValue="Électronique & High-Tech" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
                <input type="text" defaultValue="electronique" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Icône (Lucide)</label>
                  <input type="text" defaultValue="Smartphone" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Commission Spécifique (%)</label>
                  <input type="number" placeholder="Défaut (5%)" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Image de couverture (Bannière)</label>
                <div className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                  <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Uploader une image
                  </span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <button className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1">
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
                <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
                  <Save className="w-4 h-4" /> Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
