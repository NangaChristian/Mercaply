import { Card } from '../../components/ui/Card';
import { Store } from 'lucide-react';

export function BecomeSellerPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
          <Store className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Devenir vendeur</h1>
      </div>
      
      <Card className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Commencez à vendre sur MERCAPLY aujourd'hui</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Touchez des milliers de clients, développez votre chiffre d'affaires et gérez votre boutique facilement avec nos outils dédiés.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent font-bold text-xl">1</div>
            <h3 className="font-bold text-text-primary mb-2">Créez votre compte</h3>
            <p className="text-sm text-text-secondary">Inscrivez-vous en tant que vendeur et renseignez les informations de votre entreprise.</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent font-bold text-xl">2</div>
            <h3 className="font-bold text-text-primary mb-2">Ajoutez vos produits</h3>
            <p className="text-sm text-text-secondary">Prenez de belles photos, ajoutez des descriptions claires et fixez vos prix.</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent font-bold text-xl">3</div>
            <h3 className="font-bold text-text-primary mb-2">Commencez à vendre</h3>
            <p className="text-sm text-text-secondary">Recevez vos commandes, expédiez vos produits et soyez payé rapidement.</p>
          </div>
        </div>

        <div className="text-center">
          <a href="/register?role=seller" className="inline-block px-8 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-colors shadow-lg shadow-accent/25">
            Créer ma boutique maintenant
          </a>
        </div>
      </Card>
    </div>
  );
}
