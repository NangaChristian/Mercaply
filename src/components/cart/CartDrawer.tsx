import { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useCart } from '../../store/useCart';
import { cn } from '../../utils/cn';

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  // Group items by seller
  const groupedItems = items.reduce((acc, item) => {
    const sellerId = item.product.sellerId || 'unknown';
    if (!acc[sellerId]) {
      acc[sellerId] = {
        sellerName: item.product.sellerId ? `Vendeur ${item.product.sellerId.substring(0, 4)}` : 'Vendeur Inconnu',
        items: []
      };
    }
    acc[sellerId].items.push(item);
    return acc;
  }, {} as Record<string, { sellerName: string, items: typeof items }>);

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <Fragment>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-light">
          <h2 className="text-xl font-bold text-text-primary flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Mon Panier ({getCartCount()})
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-text-secondary hover:bg-surface rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-24 h-24 bg-white shadow-sm border border-border-light rounded-full flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-black/50" />
              </div>
              <h3 className="text-xl font-bold text-text-primary">Votre panier est vide</h3>
              <p className="text-text-secondary max-w-[250px]">
                Découvrez nos produits et commencez vos achats.
              </p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-6 px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-black/90 transition-all shadow-md hover:-translate-y-0.5"
              >
                Continuer mes achats
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedItems).map(([sellerId, group]) => (
                <div key={sellerId} className="space-y-4">
                  <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider border-b border-border-light pb-2">
                    {group.sellerName}
                  </h3>
                  
                  <div className="space-y-4">
                    {group.items.map((item) => {
                      const isBelowMin = item.quantity < item.product.minOrder;
                      
                      return (
                        <div key={item.id} className="flex gap-4 bg-surface/30 p-3 rounded-xl border border-border-light">
                          <div className="w-20 h-20 rounded-lg bg-surface border border-border-light overflow-hidden flex-shrink-0">
                            <img 
                              src={item.product.images?.[0] || 'https://picsum.photos/seed/placeholder/100/100'} 
                              alt={item.product.title} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-sm font-medium text-text-primary line-clamp-2">
                                  {item.product.title}
                                </h4>
                                <button 
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-text-tertiary hover:text-danger transition-colors p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              {item.variants && Object.keys(item.variants).length > 0 && (
                                <p className="text-xs text-text-tertiary mt-1">
                                  {Object.entries(item.variants).map(([k,v]) => `${k}: ${v}`).join(' - ')}
                                </p>
                              )}
                              <p className="text-sm font-bold text-text-primary mt-1">
                                {item.product.price.toLocaleString('fr-FR')} FCFA <span className="text-xs font-normal text-text-secondary">/ {item.product.unit}</span>
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center border border-border-light rounded-lg bg-background">
                                <button 
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <button 
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity + 1))}
                                  className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <span className="text-sm font-bold text-accent">
                                {(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA
                              </span>
                            </div>
                            
                            {isBelowMin && (
                              <div className="flex items-center mt-2 text-xs text-warning-dark bg-warning/10 px-2 py-1 rounded-md">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Min. {item.product.minOrder} requis
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-border-light bg-surface/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-text-secondary">Sous-total ({getCartCount()} articles)</span>
              <span className="text-2xl font-bold text-text-primary">
                {getCartTotal().toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={handleCheckout}
                className="w-full py-4 bg-black text-white font-bold rounded-full hover:bg-black/90 transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
              >
                Passer la commande
              </button>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-full py-4 bg-white border-2 border-border-light text-text-primary font-bold rounded-full hover:bg-surface transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
}
