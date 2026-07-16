import { Card } from '../../components/ui/Card';
import { ShoppingCart } from 'lucide-react';

export function HowToBuyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Comment acheter ?</h1>
      </div>
      
      <Card className="p-8">
        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="w-8 h-8 shrink-0 bg-accent text-white font-bold rounded-full flex items-center justify-center">1</div>
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Trouvez ce que vous cherchez</h3>
              <p className="text-text-secondary">Parcourez nos catégories ou utilisez la barre de recherche pour trouver les produits et services qui vous intéressent.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-8 h-8 shrink-0 bg-accent text-white font-bold rounded-full flex items-center justify-center">2</div>
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Ajoutez au panier</h3>
              <p className="text-text-secondary">Sélectionnez les options souhaitées (taille, couleur) et ajoutez les articles à votre panier d'achat.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-8 h-8 shrink-0 bg-accent text-white font-bold rounded-full flex items-center justify-center">3</div>
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Passez commande</h3>
              <p className="text-text-secondary">Validez votre panier, choisissez votre adresse de livraison et sélectionnez un mode de paiement sécurisé.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-8 h-8 shrink-0 bg-accent text-white font-bold rounded-full flex items-center justify-center">4</div>
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Suivez votre livraison</h3>
              <p className="text-text-secondary">Recevez des mises à jour sur l'état de votre commande jusqu'à sa livraison à votre domicile.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
