import { Card } from '../../components/ui/Card';
import { CreditCard } from 'lucide-react';

export function LocalPaymentsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Paiements locaux</h1>
      </div>
      
      <Card className="p-8">
        <p className="text-lg text-text-secondary mb-8">
          MERCAPLY s'adapte à vos habitudes en vous proposant les moyens de paiement les plus populaires et sécurisés de votre région.
        </p>

        <h2 className="text-xl font-bold text-text-primary mb-4">Moyens de paiement acceptés</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 border border-gray-100 rounded-xl bg-gray-50">
            <h3 className="font-bold text-text-primary mb-1">Mobile Money</h3>
            <p className="text-sm text-text-secondary">Paiement rapide et sécurisé via votre opérateur mobile (Orange Money, MTN Mobile Money, etc.)</p>
          </div>
          <div className="p-4 border border-gray-100 rounded-xl bg-gray-50">
            <h3 className="font-bold text-text-primary mb-1">Cartes Bancaires</h3>
            <p className="text-sm text-text-secondary">Paiement par carte Visa ou Mastercard avec sécurité 3D Secure.</p>
          </div>
          <div className="p-4 border border-gray-100 rounded-xl bg-gray-50">
            <h3 className="font-bold text-text-primary mb-1">Paiement à la livraison</h3>
            <p className="text-sm text-text-secondary">Payez en espèces lorsque vous recevez votre commande (disponible selon la région).</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-text-primary mb-4">Sécurité des transactions</h2>
        <p className="text-text-secondary">
          Toutes vos transactions sont cryptées et sécurisées. Nous ne stockons jamais vos informations bancaires et nous travaillons avec des partenaires de paiement certifiés.
        </p>
      </Card>
    </div>
  );
}
