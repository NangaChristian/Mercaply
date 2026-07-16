import { useAuth } from '../../store/useAuth';
import { db, doc, getDoc, updateDoc, setDoc, addDoc, deleteDoc, collection, serverTimestamp } from '../../lib/supabase-compat';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Edit, Copy, Trash2, EyeOff, Check, X } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { cn } from '../../utils/cn';

export function SellerProductsPage() {
  const { user } = useAuth();
  const { products, isLoading } = useProducts({ limitCount: 20, sellerId: user?.uid });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  const startEditingStock = (id: string, currentStock: number) => {
    setEditingStockId(id);
    setNewStockValue(currentStock);
  };

  const cancelEditingStock = () => {
    setEditingStockId(null);
  };

  const saveStock = async (productId: string) => {
    if (newStockValue < 0) return;
    setIsUpdatingStock(true);
    try {
      await updateDoc(doc(db, 'products', productId), {
        stock: newStockValue,
        updatedAt: new Date().toISOString()
      });
      setEditingStockId(null);
    } catch (error) {
      console.error('Failed to update stock:', error);
      alert('Erreur lors de la mise à jour du stock.');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = product.stock > 0 && product.isActive !== false;
    if (statusFilter === 'low_stock') matchesStatus = product.stock < 10 && product.stock > 0;
    if (statusFilter === 'out_of_stock') matchesStatus = product.stock === 0;
    if (statusFilter === 'draft') matchesStatus = product.isActive === false;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Mes produits</h1>
        <Link 
          to="/seller/products/new" 
          className="flex items-center px-4 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un produit
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-background p-4 rounded-2xl border border-border-light shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Rechercher un produit par nom ou référence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm font-medium text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="low_stock">Stock bas</option>
            <option value="out_of_stock">Rupture de stock</option>
            <option value="draft">Brouillons</option>
          </select>
          <button className="p-2.5 bg-surface border border-border-light rounded-xl text-text-secondary hover:text-text-primary hover:bg-border-light transition-colors">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-background rounded-2xl border border-border-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-text-secondary text-sm">
                <th className="p-4 w-12"><input type="checkbox" className="rounded border-border-light text-accent focus:ring-accent" /></th>
                <th className="p-4 font-medium">Produit</th>
                <th className="p-4 font-medium">Catégorie</th>
                <th className="p-4 font-medium">Prix</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Statut</th>
                <th className="p-4 font-medium">Ventes</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-tertiary">Chargement des produits...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-tertiary">Aucun produit trouvé.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-surface/50 transition-colors group">
                    <td className="p-4"><input type="checkbox" className="rounded border-border-light text-accent focus:ring-accent" /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-surface border border-border-light overflow-hidden flex-shrink-0">
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary line-clamp-1">{product.title}</p>
                          <p className="text-xs text-text-tertiary mt-0.5">Réf: {product.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-text-secondary text-sm">{product.category}</td>
                    <td className="p-4 font-medium text-text-primary">{product.price.toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-4">
                      {editingStockId === product.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min="0"
                            value={newStockValue} 
                            onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 bg-surface border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                            disabled={isUpdatingStock}
                            autoFocus
                          />
                          <button 
                            onClick={() => saveStock(product.id)}
                            disabled={isUpdatingStock}
                            className="p-1 text-success hover:bg-success/10 rounded"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={cancelEditingStock}
                            disabled={isUpdatingStock}
                            className="p-1 text-danger hover:bg-danger/10 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group/stock cursor-pointer" onClick={() => startEditingStock(product.id, product.stock)}>
                          <span className={cn(
                            "text-sm font-medium",
                            product.stock > 10 ? "text-success" : product.stock > 0 ? "text-warning-dark" : "text-danger"
                          )}>
                            {product.stock} {product.unit}
                          </span>
                          <Edit className="h-3 w-3 text-text-tertiary opacity-0 group-hover/stock:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        product.stock > 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                      )}>
                        {product.stock > 0 ? 'Actif' : 'Rupture'}
                      </span>
                    </td>
                    <td className="p-4 text-text-secondary text-sm">{Math.floor(Math.random() * 100)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/seller/products/${product.id}/edit`} className="p-1.5 text-text-secondary hover:text-accent hover:bg-accent/10 rounded-lg transition-colors" title="Modifier">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Dupliquer">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-text-secondary hover:text-warning-dark hover:bg-warning/10 rounded-lg transition-colors" title="Désactiver">
                          <EyeOff className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors" title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-border-light flex items-center justify-between">
          <p className="text-sm text-text-secondary">Affichage de 1 à {filteredProducts.length} sur {filteredProducts.length} produits</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-border-light rounded-md text-sm font-medium text-text-secondary hover:bg-surface disabled:opacity-50" disabled>Précédent</button>
            <button className="px-3 py-1 bg-accent text-white rounded-md text-sm font-medium">1</button>
            <button className="px-3 py-1 border border-border-light rounded-md text-sm font-medium text-text-secondary hover:bg-surface">2</button>
            <button className="px-3 py-1 border border-border-light rounded-md text-sm font-medium text-text-secondary hover:bg-surface">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
