import { Card } from '../../components/ui/Card';
import { HelpCircle } from 'lucide-react';

export function HelpCenterPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
          <HelpCircle className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Centre d'aide</h1>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-text-primary mb-2">Acheteurs</h3>
          <p className="text-text-secondary text-sm mb-4">Trouvez des réponses concernant vos commandes, les paiements et la livraison.</p>
          <ul className="space-y-2 text-sm">
            <li><a href="/comment-acheter" className="text-accent hover:underline">Comment passer une commande ?</a></li>
            <li><a href="/paiements-locaux" className="text-accent hover:underline">Méthodes de paiement acceptées</a></li>
            <li><a href="/protection-acheteur" className="text-accent hover:underline">Politique de retour et remboursement</a></li>
          </ul>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-bold text-text-primary mb-2">Vendeurs</h3>
          <p className="text-text-secondary text-sm mb-4">Gérez votre boutique, vos produits et développez vos ventes.</p>
          <ul className="space-y-2 text-sm">
            <li><a href="/devenir-vendeur" className="text-accent hover:underline">Comment créer une boutique ?</a></li>
            <li><a href="/regles-vente" className="text-accent hover:underline">Règles et politiques pour les vendeurs</a></li>
            <li><a href="#" className="text-accent hover:underline">Conseils pour booster vos ventes</a></li>
          </ul>
        </Card>
      </div>

      <div className="mt-8 text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
        <h3 className="text-lg font-bold text-text-primary mb-2">Vous ne trouvez pas la réponse ?</h3>
        <p className="text-text-secondary mb-4">Notre équipe de support est là pour vous aider.</p>
        <button className="px-6 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition-colors">
          Nous contacter
        </button>
      </div>
    </div>
  );
}
