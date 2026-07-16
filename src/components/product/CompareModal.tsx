import React from 'react';
import { X } from 'lucide-react';
import { useCompare } from '../../store/useCompare';

export function CompareModal() {
  const { compareItems, isCompareModalOpen, setCompareModalOpen, removeCompare } = useCompare();

  if (!isCompareModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCompareModalOpen(false)}></div>
      
      <div className="relative w-full max-w-5xl bg-background rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border-light flex justify-between items-center bg-surface">
          <h2 className="text-xl font-bold text-text-primary">Comparaison de produits</h2>
          <button 
            onClick={() => setCompareModalOpen(false)}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-border-light rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {compareItems.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              Aucun produit sélectionné pour la comparaison.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th className="p-4 border-b border-border-light font-medium text-text-secondary w-1/4">Produit</th>
                    {compareItems.map(item => (
                      <th key={item.id} className="p-4 border-b border-border-light w-1/4 align-top relative">
                        <button 
                          onClick={() => removeCompare(item.id)}
                          className="absolute top-2 right-2 p-1 bg-surface rounded-full text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="w-full h-32 bg-surface rounded-xl overflow-hidden mb-3">
                          <img 
                            src={item.images?.[0] || 'https://via.placeholder.com/200'} 
                            alt={item.title} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <h3 className="font-bold text-text-primary text-sm line-clamp-2 leading-tight">{item.title}</h3>
                        <p className="text-accent font-bold mt-2">{(item.price || 0).toLocaleString('fr-FR')} FCFA</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border-b border-border-light font-medium text-text-secondary bg-surface/30">Catégorie</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-4 border-b border-border-light text-sm text-text-primary bg-surface/30">
                        {item.category || 'Non spécifié'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 border-b border-border-light font-medium text-text-secondary">Marque</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-4 border-b border-border-light text-sm text-text-primary">
                        {item.brand || 'Non spécifié'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 border-b border-border-light font-medium text-text-secondary bg-surface/30">Description</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="p-4 border-b border-border-light text-sm text-text-secondary bg-surface/30">
                        <p className="line-clamp-4">{item.description}</p>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
