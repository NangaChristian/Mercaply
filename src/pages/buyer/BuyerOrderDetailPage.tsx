import { useAuth } from '../../store/useAuth';
// @ts-nocheck
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Package, Truck, CheckCircle2, MapPin, CreditCard, Clock, FileText, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useOrders } from '../../hooks/useOrders';

const steps = [
  { id: 'pending', label: 'Commandé', icon: FileText },
  { id: 'confirmed', label: 'Confirmé', icon: CheckCircle2 },
  { id: 'processing', label: 'En préparation', icon: Package },
  { id: 'shipped', label: 'Expédié', icon: Truck },
  { id: 'delivered', label: 'Livré', icon: MapPin },
];

export function BuyerOrderDetailPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const { orders } = useOrders(user?.uid || '', 'buyer');
  
  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-xl font-bold text-text-primary">Commande introuvable</h2>
        <Link to="/buyer/orders" className="text-accent hover:underline">Retour à mes commandes</Link>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex(s => s.id === order.status);
  
  const statusLabels: Record<string, string> = {
    pending: 'Commandé',
    confirmed: 'Confirmé',
    processing: 'En préparation',
    shipped: 'Expédié',
    delivered: 'Livré'
  };

  const timeline = [
    { status: 'Commande passée', date: order.createdAt || 'Inconnue', description: 'Votre commande a été enregistrée.' }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/buyer/orders" className="p-2 bg-background border border-border-light rounded-full hover:bg-surface transition-colors">
          <ChevronLeft className="h-5 w-5 text-text-secondary" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Détails de la commande</h1>
          <p className="text-sm text-text-secondary mt-1">Commande n° {order.id} • Passée le {order.createdAt || 'Inconnue'}</p>
        </div>
      </div>

      {/* Stepper */}
      {order.status !== 'cancelled' && (
        <div className="bg-background rounded-2xl p-6 sm:p-8 border border-border-light shadow-sm">
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
              />
            </div>
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const StepIcon = step.icon;
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-4 border-background relative z-10 transition-colors duration-300",
                      isCompleted ? "bg-accent text-white" : "bg-surface text-text-tertiary"
                    )}>
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <span className={cn(
                      "text-xs font-medium mt-2 text-center w-20 sm:w-24 absolute top-12",
                      isCurrent ? "text-accent" : isCompleted ? "text-text-primary" : "text-text-tertiary"
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="h-12"></div> {/* Spacer for absolute text */}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-background rounded-2xl border border-border-light shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-light bg-surface/50 flex justify-between items-center">
              <h2 className="font-bold text-text-primary">Articles commandés</h2>
              <span className="text-sm text-text-secondary">Vendu par <span className="font-medium text-accent">{order.sellerId ? 'Vendeur' : 'Boutique'}</span></span>
            </div>
            <div className="p-6 space-y-6">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-surface border border-border-light overflow-hidden flex-shrink-0">
                    <img src={item.product?.images?.[0] || item.image || ''} alt={item.product?.title || item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-base font-medium text-text-primary truncate">{item.product?.title || item.name}</h4>
                    <p className="text-sm text-text-secondary mt-1">{(item.product?.price || item.price || 0).toLocaleString('fr-FR')} FCFA × {item.quantity || item.qty || 1}</p>
                  </div>
                  <div className="text-right flex flex-col justify-center flex-shrink-0">
                    <p className="text-base font-bold text-text-primary">{((item.product?.price || item.price || 0) * (item.quantity || item.qty || 1)).toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Actions */}
            <div className="px-6 py-4 bg-surface/30 border-t border-border-light flex flex-wrap gap-3">
              {order.status === 'pending' && (
                <button className="px-4 py-2 bg-background border border-danger text-danger text-sm font-medium rounded-lg hover:bg-danger/5 transition-colors">
                  Annuler la commande
                </button>
              )}
              {order.status === 'shipped' && (
                <button className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors">
                  Confirmer la réception
                </button>
              )}
              {order.status === 'delivered' && (
                <button className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors">
                  Laisser un avis
                </button>
              )}
              <button className="px-4 py-2 bg-background border border-border-light text-text-primary text-sm font-medium rounded-lg hover:bg-surface transition-colors">
                Contacter le vendeur
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-background rounded-2xl border border-border-light shadow-sm p-6">
            <h2 className="font-bold text-text-primary mb-6">Historique de la commande</h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-light before:to-transparent">
              {timeline.map((event, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-surface text-text-tertiary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border-light bg-background shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-text-primary">{event.status}</h4>
                      <span className="text-xs font-medium text-text-tertiary">{event.date.split(',')[0]}</span>
                    </div>
                    <p className="text-sm text-text-secondary">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Info */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-background rounded-2xl border border-border-light shadow-sm p-6">
            <h2 className="font-bold text-text-primary mb-4">Résumé de la commande</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Sous-total ({order.items?.length || 0} articles)</span>
                <span>{((order.total || 0) * 0.95).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Frais de livraison</span>
                <span>{((order.total || 0) * 0.05).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="pt-3 border-t border-border-light flex justify-between items-center">
                <span className="font-bold text-text-primary">Total</span>
                <span className="text-lg font-bold text-accent">{(order.total || 0).toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-background rounded-2xl border border-border-light shadow-sm p-6">
            <h2 className="font-bold text-text-primary mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-text-tertiary" />
              Adresse de livraison
            </h2>
            <div className="text-sm text-text-secondary space-y-1">
              <p className="font-medium text-text-primary">{order.shippingAddress?.name || order.customer?.name || 'Inconnu'}</p>
              <p>{order.shippingAddress?.details || order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}</p>
              <p className="pt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1.5 text-text-tertiary" />
                {order.shippingAddress?.phone}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-background rounded-2xl border border-border-light shadow-sm p-6">
            <h2 className="font-bold text-text-primary mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-text-tertiary" />
              Méthode de paiement
            </h2>
            <p className="text-sm text-text-secondary">{order.paymentMethod || 'Non spécifié'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
