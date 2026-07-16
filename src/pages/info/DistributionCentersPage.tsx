import { Card } from '../../components/ui/Card';
import { Package } from 'lucide-react';

export function DistributionCentersPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
          <Package className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Centres de distribution</h1>
      </div>
      
      <Card className="p-8">
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-accent mb-2">Bientôt disponible</h2>
          <p className="text-text-secondary">
            Le service de stockage et de distribution MERCAPLY est actuellement en cours de déploiement. Ce service permettra aux vendeurs de nous confier leur stock pour des expéditions ultra-rapides.
          </p>
        </div>

        <h2 className="text-xl font-bold text-text-primary mb-4">Avantages du programme (À venir)</h2>
        <ul className="list-disc pl-5 text-text-secondary space-y-3 mb-6">
          <li><strong>Expédition Premium :</strong> Vos produits sont expédiés le jour même pour des livraisons en 24h.</li>
          <li><strong>Zéro logistique :</strong> Nous gérons le stockage, l'emballage et l'expédition de A à Z.</li>
          <li><strong>Visibilité accrue :</strong> Les produits expédiés par MERCAPLY bénéficient d'un badge spécial et d'une meilleure visibilité.</li>
        </ul>
      </Card>
    </div>
  );
}
