import { useAuth } from '../../store/useAuth';
// @ts-nocheck
import { useState } from 'react';
import { Search, Filter, Package, Truck, CheckCircle2, XCircle, Clock, ChevronRight, Eye } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { cn } from '../../utils/cn';

const tabs = [
  { id: 'all', label: 'Toutes' },
  { id: 'pending', label: 'À traiter' },
  { id: 'processing', label: 'Confirmées' },
  { id: 'shipped', label: 'Expédiées' },
  { id: 'delivered', label: 'Livrées' },
  { id: 'cancelled', label: 'Annulées' },
];

export function SellerOrdersPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { orders, isLoading } = useOrders(user?.uid || '', 'seller');

  const filteredOrders = orders.filter(order => 
    (activeTab === 'all' || order.status === activeTab) &&
    (order.id.toLowerCase().includes(searchQuery.toLowerCase()) || order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Commandes reçues</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 overflow-x-auto pb-2 hide-scrollbar border-b border-border-light">
        {tabs.map((tab) => {
          const count = tab.id === 'all' ? orders.length : orders.filter(o => o.status === tab.id).length;
          return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center",
              activeTab === tab.id 
                ? "border-accent text-accent" 
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-light"
            )}
          >
            {tab.label}
            {count > 0 && (
              <span className={cn(
                "ml-2 px-2 py-0.5 rounded-full text-xs",
                activeTab === tab.id ? "bg-accent/10 text-accent" : "bg-surface text-text-tertiary"
              )}>
                {count}
              </span>
            )}
          </button>
        )})}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Rechercher par N° de commande ou client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
        <button className="px-4 py-2.5 bg-background border border-border-light rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface transition-colors flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filtres avancés
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-background rounded-2xl border border-border-light p-12 text-center">
            <Package className="h-12 w-12 text-text-tertiary mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-text-primary">Aucune commande trouvée</h3>
            <p className="text-text-secondary mt-1">Essayez de modifier vos filtres ou votre recherche.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-background rounded-2xl border border-border-light p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row gap-6 justify-between">
                
                {/* Order Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between lg:justify-start lg:gap-4">
                    <div>
                      <h3 className="font-bold text-text-primary">{order.id}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">{order.createdAt || 'N/A'}</p>
                    </div>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                      order.status === 'pending' ? 'bg-warning/10 text-warning-dark' :
                      order.status === 'processing' ? 'bg-accent/10 text-accent' :
                      order.status === 'shipped' ? 'bg-primary/10 text-primary' :
                      order.status === 'delivered' ? 'bg-success/10 text-success' :
                      'bg-danger/10 text-danger'
                    )}>
                      {order.status === 'pending' ? <Clock className="h-3 w-3 mr-1" /> :
                       order.status === 'processing' ? <Package className="h-3 w-3 mr-1" /> :
                       order.status === 'shipped' ? <Truck className="h-3 w-3 mr-1" /> :
                       order.status === 'delivered' ? <CheckCircle2 className="h-3 w-3 mr-1" /> :
                       <XCircle className="h-3 w-3 mr-1" />}
                      {order.status === 'pending' ? 'À traiter' :
                       order.status === 'processing' ? 'Confirmée' :
                       order.status === 'shipped' ? 'Expédiée' :
                       order.status === 'delivered' ? 'Livrée' : 'Annulée'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 bg-surface/50 p-3 rounded-xl border border-border-light w-fit">
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                      {order.customer?.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{order.customer?.name || 'Inconnu'}</p>
                      <p className="text-xs text-text-secondary">Client B2B</p>
                    </div>
                  </div>
                </div>

                {/* Items & Total */}
                <div className="flex-1 border-t lg:border-t-0 lg:border-l border-border-light pt-4 lg:pt-0 lg:pl-6">
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm items-start">
                        <div className="flex flex-col">
                          <span className="text-text-secondary">{item.quantity || item.qty || 1}x {item.product?.title || item.name || 'Produit'}</span>
                          {item.variants && Object.keys(item.variants).length > 0 && (
                            <span className="text-xs text-text-tertiary">
                              {Object.entries(item.variants).map(([k,v]) => `${k}: ${v}`).join(' - ')}
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-text-primary ml-4">{((item.quantity || item.qty || 1) * (item.product?.price || item.price || 0)).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-border-light">
                    <div>
                      <p className="text-xs text-text-secondary mb-1">Paiement</p>
                      <p className="text-sm font-medium text-text-primary">{order.paymentMethod || 'Non spécifié'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-secondary mb-1">Total</p>
                      <p className="text-lg font-bold text-accent">{(order.total || 0).toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row lg:flex-col gap-2 border-t lg:border-t-0 lg:border-l border-border-light pt-4 lg:pt-0 lg:pl-6 justify-center lg:w-48">
                  {order.status === 'pending' && (
                    <button className="flex-1 lg:flex-none py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover transition-colors">
                      Confirmer
                    </button>
                  )}
                  {order.status === 'processing' && (
                    <button className="flex-1 lg:flex-none py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors">
                      Marquer expédié
                    </button>
                  )}
                  <button className="flex-1 lg:flex-none py-2.5 bg-surface border border-border-light text-text-primary text-sm font-medium rounded-xl hover:bg-border-light transition-colors flex items-center justify-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Détails
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
