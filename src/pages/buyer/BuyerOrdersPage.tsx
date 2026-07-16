import { useAuth } from '../../store/useAuth';
// @ts-nocheck
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronRight, Package, Truck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';
import { OrderTracking } from '../../components/orders/OrderTracking';
import { useOrders } from '../../hooks/useOrders';

const statusConfig = {
  pending: { label: 'En attente', icon: Clock, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
  processing: { label: 'En préparation', icon: Package, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
  shipped: { label: 'Expédié', icon: Truck, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
  delivered: { label: 'Livré', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  cancelled: { label: 'Annulé', icon: XCircle, color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' },
};

export function BuyerOrdersPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { orders } = useOrders(user?.uid || '', 'buyer');

  const filteredOrders = orders.filter(order => {
    const matchesFilter = 
      activeFilter === 'all' ? true :
      activeFilter === 'ongoing' ? ['pending', 'processing', 'shipped'].includes(order.status) :
      activeFilter === 'delivered' ? order.status === 'delivered' :
      activeFilter === 'cancelled' ? order.status === 'cancelled' : true;
      
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (order.items || []).some(item => (item.product?.title || item.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
                          
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Mes commandes</h1>
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-tertiary" />
          </div>
          <input
            type="text"
            placeholder="N° de commande, article..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-background"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex overflow-x-auto custom-scrollbar pb-2 gap-2">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'ongoing', label: 'En cours' },
          { id: 'delivered', label: 'Livrées' },
          { id: 'cancelled', label: 'Annulées' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
              activeFilter === filter.id 
                ? "bg-text-primary text-white border-text-primary" 
                : "bg-background text-text-secondary border-border-light hover:bg-surface"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => {
            const status = statusConfig[order.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            
            return (
              <div key={order.id} className="bg-background rounded-2xl border border-border-light overflow-hidden shadow-sm">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-border-light bg-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div>
                      <p className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-1">Commande passée le</p>
                      <p className="text-sm font-medium text-text-primary">{order.createdAt || 'Date inconnue'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-1">Total</p>
                      <p className="text-sm font-medium text-text-primary">{(order.total || 0).toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-1">N° de commande</p>
                      <p className="text-sm font-medium text-text-primary">{order.id}</p>
                    </div>
                  </div>
                  <Link 
                    to={`/buyer/orders/${order.id}`}
                    className="text-sm font-medium text-accent hover:underline flex items-center"
                  >
                    Voir les détails <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>

                {/* Order Body */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className={cn("inline-flex items-center px-3 py-1.5 rounded-lg border text-sm font-medium", status.bg, status.color, status.border)}>
                      <StatusIcon className="h-4 w-4 mr-2" />
                      {status.label}
                    </div>
                    <span className="text-sm text-text-secondary">Vendu par <span className="font-medium text-text-primary">{order.sellerId ? 'Vendeur' : 'Boutique'}</span></span>
                  </div>
                  <div className="mb-6 border-b border-border-light pb-6">
                    <OrderTracking status={order.status} />
                  </div>

                  <div className="space-y-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-surface border border-border-light overflow-hidden flex-shrink-0">
                          <img src={item.product?.images?.[0] || item.image} alt={item.product?.title || item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-text-primary truncate">{item.product?.title || item.name}</h4>
                          <p className="text-sm text-text-secondary mt-1">Qté: {item.quantity || item.qty || 1}</p>
                          {item.variants && Object.keys(item.variants).length > 0 && (
                            <p className="text-xs text-text-tertiary mt-1">
                              {Object.entries(item.variants).map(([k,v]) => `${k}: ${v}`).join(' - ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-text-primary">{((item.product?.price || item.price || 0) * (item.quantity || item.qty || 1)).toLocaleString('fr-FR')} FCFA</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-6 border-t border-border-light flex flex-wrap gap-3">
                    {order.status === 'delivered' && (
                      <button className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors">
                        Acheter à nouveau
                      </button>
                    )}
                    <button className="px-4 py-2 bg-surface border border-border-light text-text-primary text-sm font-medium rounded-lg hover:bg-border-light transition-colors">
                      Contacter le vendeur
                    </button>
                    {order.status === 'delivered' && (
                      <button className="px-4 py-2 bg-background border border-border-light text-text-primary text-sm font-medium rounded-lg hover:bg-surface transition-colors">
                        Laisser un avis
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-background rounded-2xl border border-border-light">
            <Package className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Aucune commande trouvée</h3>
            <p className="text-text-secondary">Vous n'avez pas de commandes correspondant à ces critères.</p>
          </div>
        )}
      </div>
    </div>
  );
}
