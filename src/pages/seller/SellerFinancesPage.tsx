import { useAuth } from '../../store/useAuth';
// @ts-nocheck
import { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useOrders } from '../../hooks/useOrders';

export function SellerFinancesPage() {
  const { user } = useAuth();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const { orders: sellerOrders, isLoading } = useOrders(user?.uid || '', 'seller');

  const validOrders = sellerOrders.filter(o => o.status === 'delivered' || o.status === 'completed');
  const pendingOrders = sellerOrders.filter(o => o.status === 'pending' || o.status === 'processing');
  
  const balance = validOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingBalance = pendingOrders.reduce((sum, order) => sum + order.total, 0);
  
  // Transform orders into transactions for display
  const transactions = sellerOrders.map(order => ({
    id: order.id,
    date: new Date(order.createdAt).toLocaleDateString(),
    type: 'sale',
    amount: order.total,
    status: order.status === 'delivered' || order.status === 'completed' ? 'completed' : 'pending',
    ref: `CMD-${order.id.slice(-6).toUpperCase()}`
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoading) {
    return <div className="p-8 text-center text-text-secondary">Chargement de vos finances...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Finances</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="lg:col-span-1 bg-accent rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <p className="text-white/80 font-medium mb-2">Solde disponible</p>
          <h2 className="text-4xl font-bold mb-8">{balance.toLocaleString('fr-FR')} <span className="text-2xl font-normal">FCFA</span></h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-white/20 pb-2">
              <span className="text-white/80">En attente de validation</span>
              <span className="font-medium">{pendingBalance.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/80">Total retiré (ce mois)</span>
              <span className="font-medium">0 FCFA</span>
            </div>
          </div>

          <button 
            onClick={() => setIsWithdrawModalOpen(true)}
            className="w-full mt-8 py-3.5 bg-white text-accent font-bold rounded-xl hover:bg-white/90 transition-colors shadow-sm"
          >
            Demander un retrait
          </button>
        </div>

        {/* Transactions History */}
        <div className="lg:col-span-2 bg-background rounded-2xl border border-border-light shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border-light flex justify-between items-center">
            <h3 className="text-lg font-bold text-text-primary">Historique des transactions</h3>
            <button className="text-sm font-medium text-accent hover:underline">Voir tout</button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface text-text-secondary text-sm">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Montant</th>
                  <th className="p-4 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-surface/50 transition-colors">
                    <td className="p-4 text-text-secondary text-sm">{trx.date}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0",
                          trx.type === 'sale' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                        )}>
                          {trx.type === 'sale' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary text-sm">{trx.type === 'sale' ? 'Vente' : 'Retrait'}</p>
                          <p className="text-xs text-text-tertiary">{trx.ref}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "font-bold",
                        trx.type === 'sale' ? "text-success" : "text-text-primary"
                      )}>
                        {trx.type === 'sale' ? '+' : ''}{trx.amount.toLocaleString('fr-FR')} FCFA
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        trx.status === 'completed' ? "bg-success/10 text-success" : 
                        trx.status === 'pending' ? "bg-warning/10 text-warning-dark" : "bg-danger/10 text-danger"
                      )}>
                        {trx.status === 'completed' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : 
                         trx.status === 'pending' ? <Clock className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                        {trx.status === 'completed' ? 'Terminé' : 
                         trx.status === 'pending' ? 'En cours' : 'Échoué'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Withdraw Modal (Mock) */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-text-primary mb-4">Demander un retrait</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Montant (FCFA)</label>
                <input type="number" placeholder="Ex: 50000" className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
                <p className="text-xs text-text-tertiary mt-1">Solde max: 450 000 FCFA</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Méthode de retrait</label>
                <select className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
                  <option>MTN Mobile Money (...1234)</option>
                  <option>Orange Money (...5678)</option>
                  <option>Virement Bancaire (...9012)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsWithdrawModalOpen(false)} className="flex-1 py-2.5 bg-surface border border-border-light text-text-primary font-medium rounded-xl hover:bg-border-light transition-colors">Annuler</button>
              <button onClick={() => setIsWithdrawModalOpen(false)} className="flex-1 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
