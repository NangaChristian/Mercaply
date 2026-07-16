import { db, doc, getDoc, updateDoc, setDoc, addDoc, deleteDoc, collection, serverTimestamp } from '../../lib/supabase-compat';
import { useCategories } from '../../contexts/CategoriesContext';
import React from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useServices } from '../../hooks/useServices';
import { useAuth } from '../../store/useAuth';


export function SellerServicesPage() {
  const { productCategories: PRODUCT_CATEGORIES, serviceCategories: SERVICE_CATEGORIES } = useCategories();

  const { user: user } = useAuth();
  const { services, isLoading } = useServices({ sellerId: user?.uid });
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce service ?')) {
      try {
        await deleteDoc(doc(db, 'services', id));
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full mx-auto" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Mes Services</h1>
        <Link 
          to="/seller/services/new"
          className="px-6 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Service
        </Link>
      </div>

      <div className="bg-surface rounded-2xl border border-border-light overflow-hidden">
        <div className="p-4 border-b border-border-light">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <input 
              type="text"
              placeholder="Rechercher un service..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Prix</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Type Prix</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">Vues</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-tertiary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-border-light overflow-hidden">
                        {service.images?.[0] ? (
                          <img src={service.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-gray-200" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-text-primary">{service.title}</div>
                        <div className="text-sm text-text-tertiary">{service.isActive ? 'Actif' : 'Inactif'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background border border-border-light text-text-secondary">
                      {SERVICE_CATEGORIES.find(c => c.id === service.category)?.name || service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary font-medium">
                    {service.price.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                     {service.priceType === 'hourly' ? 'Par heure' : service.priceType === 'fixed' ? 'Fixe' : 'À partir de'}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                     {service.views || 0}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/seller/services/${service.id}/edit`)}
                        className="p-2 text-text-tertiary hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id)}
                        className="p-2 text-text-tertiary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-tertiary">
                    Aucun service trouvé. Cliquez sur "Nouveau Service" pour en créer un.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
