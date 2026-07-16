import { Card } from '../../components/ui/Card';
import { ShieldCheck } from 'lucide-react';

export function BuyerProtectionPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Protection de l'acheteur</h1>
      </div>
      
      <Card className="p-8">
        <p className="text-lg text-text-secondary mb-8">
          Achetez en toute confiance. La Protection Acheteur MERCAPLY vous couvre de la commande jusqu'à la livraison.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Remboursement intégral si l'article n'est pas reçu</h3>
            <p className="text-text-secondary">Si votre commande n'arrive pas dans le délai de livraison estimé, nous vous remboursons intégralement.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Remboursement si l'article n'est pas conforme</h3>
            <p className="text-text-secondary">Si l'article reçu est significativement différent de sa description, vous pouvez le retourner et obtenir un remboursement.</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Paiements sécurisés</h3>
            <p className="text-text-secondary">Vos paiements sont conservés de manière sécurisée et ne sont reversés au vendeur que lorsque vous avez confirmé la bonne réception de la commande.</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 bg-gray-50 p-6 rounded-xl">
          <h3 className="font-bold text-text-primary mb-2">Comment ouvrir un litige ?</h3>
          <p className="text-text-secondary text-sm">
            Allez dans vos commandes, sélectionnez la commande posant problème et cliquez sur "Ouvrir un litige". Notre équipe examinera votre demande sous 48h.
          </p>
        </div>
      </Card>
    </div>
  );
}
