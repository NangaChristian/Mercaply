import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, MoreVertical, Store, CheckCircle, XCircle, Ban } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AdminActionModal } from '../../components/admin/AdminActionModal';
import { useToast } from '../../store/useToast';

interface StoreData {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

import { logAdminAction } from '../../utils/adminAudit';

export function AdminStoresPage() {
  const { addToast } = useToast();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [storeToSuspend, setStoreToSuspend] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStores() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) setStores(data);
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStores();
  }, []);

  const handleSuspendStore = (reason: string) => {
    // Implement suspension logic here
    if (storeToSuspend) {
      logAdminAction('suspend_store', storeToSuspend, reason);
    }
    addToast('success', `La boutique a été suspendue. Raison: ${reason}`);
    setStoreToSuspend(null);
  };

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Boutiques</h1>
          <p className="text-text-secondary mt-1">Gérez les boutiques des vendeurs.</p>
        </div>
        
        <div className="w-full sm:w-auto">
          <Input
            placeholder="Rechercher une boutique..."
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
                <th className="p-4 font-medium text-text-secondary text-sm">Boutique</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Statut</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Création</th>
                <th className="p-4 font-medium text-text-secondary text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-secondary">
                    Chargement des boutiques...
                  </td>
                </tr>
              ) : filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-secondary">
                    Aucune boutique trouvée.
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-surface-hover transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <Store className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{store.name}</p>
                          <p className="text-xs text-text-secondary line-clamp-1 max-w-xs">
                            {store.description || 'Aucune description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-sm font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md w-fit">
                        <CheckCircle className="h-4 w-4" /> Actif
                      </span>
                    </td>
                    <td className="p-4 text-sm text-text-secondary">
                      {formatDistanceToNow(new Date(store.created_at), { addSuffix: true, locale: fr })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 text-error hover:bg-error/10"
                          onClick={() => setStoreToSuspend(store.id)}
                        >
                          <Ban className="h-5 w-5" />
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
        isOpen={!!storeToSuspend}
        onClose={() => setStoreToSuspend(null)}
        onConfirm={handleSuspendStore}
        title="Suspendre la boutique"
        description="Cette action rendra la boutique et tous ses produits invisibles sur la plateforme."
        actionLabel="Suspendre"
        isDestructive={true}
      />
    </div>
  );
}
