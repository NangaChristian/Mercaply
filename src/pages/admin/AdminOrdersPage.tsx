import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, MoreVertical, ShoppingCart, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface OrderData {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        if (data) setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center gap-1 text-sm font-medium text-orange-500 bg-orange-500/10 px-2 py-1 rounded-md w-fit"><Clock className="h-4 w-4" /> En attente</span>;
      case 'processing':
        return <span className="flex items-center gap-1 text-sm font-medium text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md w-fit"><ShoppingCart className="h-4 w-4" /> En cours</span>;
      case 'shipped':
        return <span className="flex items-center gap-1 text-sm font-medium text-purple-500 bg-purple-500/10 px-2 py-1 rounded-md w-fit"><Truck className="h-4 w-4" /> Expédié</span>;
      case 'delivered':
        return <span className="flex items-center gap-1 text-sm font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md w-fit"><CheckCircle className="h-4 w-4" /> Livré</span>;
      case 'cancelled':
        return <span className="flex items-center gap-1 text-sm font-medium text-error bg-error/10 px-2 py-1 rounded-md w-fit"><XCircle className="h-4 w-4" /> Annulé</span>;
      default:
        return <span className="flex items-center gap-1 text-sm font-medium text-text-secondary bg-surface-hover px-2 py-1 rounded-md w-fit">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Commandes</h1>
          <p className="text-text-secondary mt-1">Gérez et suivez toutes les commandes de la plateforme.</p>
        </div>
        
        <div className="w-full sm:w-auto">
          <Input
            placeholder="Rechercher par ID..."
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
                <th className="p-4 font-medium text-text-secondary text-sm">ID Commande</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Date</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Montant</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Statut</th>
                <th className="p-4 font-medium text-text-secondary text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    Chargement des commandes...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-hover transition-colors">
                    <td className="p-4 font-medium font-mono text-sm text-text-primary">
                      {order.id.split('-')[0].toUpperCase()}
                    </td>
                    <td className="p-4 text-sm text-text-secondary">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: fr })}
                    </td>
                    <td className="p-4 font-bold">
                      {order.total_amount.toLocaleString()} CFA
                    </td>
                    <td className="p-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" className="p-2">
                        <MoreVertical className="h-5 w-5 text-text-secondary" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
