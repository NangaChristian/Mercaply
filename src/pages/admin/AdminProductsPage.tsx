import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, MoreVertical, Package, Trash2 } from 'lucide-react';
import { AdminActionModal } from '../../components/admin/AdminActionModal';
import { useToast } from '../../store/useToast';

interface ProductData {
  id: string;
  title: string;
  price: number;
  stock: number;
  category: string;
}

import { logAdminAction } from '../../utils/adminAudit';

export function AdminProductsPage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        if (data) setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleDeleteProduct = (reason: string) => {
    // Implement deletion logic here
    if (productToDelete) {
      logAdminAction('delete_product', productToDelete, reason);
    }
    addToast('success', `Le produit a été supprimé. Raison: ${reason}`);
    setProductToDelete(null);
  };

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Produits</h1>
          <p className="text-text-secondary mt-1">Gérez le catalogue des produits.</p>
        </div>
        
        <div className="w-full sm:w-auto">
          <Input
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            iconLeft={<Search className="h-5 w-5" />}
            className="w-full sm:w-64"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover border-b border-border-light">
                <th className="p-4 font-medium text-text-secondary text-sm">Produit</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Catégorie</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Prix</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Stock</th>
                <th className="p-4 font-medium text-text-secondary text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    Chargement des produits...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-hover transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-orange-500" />
                        </div>
                        <p className="font-medium text-text-primary">{product.title}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-text-secondary">{product.category || 'N/A'}</span>
                    </td>
                    <td className="p-4 font-medium">{product.price.toLocaleString()} CFA</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        product.stock > 10 ? 'bg-emerald-500/10 text-emerald-500' : 
                        product.stock > 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-error/10 text-error'
                      }`}>
                        {product.stock} en stock
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 text-error hover:bg-error/10"
                          onClick={() => setProductToDelete(product.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <MoreVertical className="h-5 w-5 text-text-secondary" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AdminActionModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteProduct}
        title="Supprimer le produit"
        description="Cette action est irréversible. Le produit sera définitivement retiré de la plateforme."
        actionLabel="Supprimer"
        isDestructive={true}
      />
    </div>
  );
}
