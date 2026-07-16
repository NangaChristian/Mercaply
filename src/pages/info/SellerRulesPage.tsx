import { Card } from '../../components/ui/Card';
import { FileText } from 'lucide-react';

export function SellerRulesPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Règles de vente</h1>
      </div>
      
      <Card className="p-8 prose prose-gray max-w-none">
        <p className="text-lg text-text-secondary mb-6">
          Pour garantir une expérience optimale à nos acheteurs, tous les vendeurs sur MERCAPLY s'engagent à respecter les règles suivantes.
        </p>

        <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">1. Produits interdits</h2>
        <p className="text-text-secondary mb-4">Il est strictement interdit de vendre :</p>
        <ul className="list-disc pl-5 text-text-secondary space-y-2 mb-6">
          <li>Des articles contrefaits ou enfreignant des droits de propriété intellectuelle.</li>
          <li>Des produits illégaux, dangereux ou soumis à restriction sans autorisation.</li>
          <li>Des produits expirés ou dans un état ne correspondant pas à la description.</li>
        </ul>

        <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">2. Qualité de service</h2>
        <ul className="list-disc pl-5 text-text-secondary space-y-2 mb-6">
          <li><strong>Expédition rapide :</strong> Les commandes doivent être traitées dans les délais annoncés.</li>
          <li><strong>Communication :</strong> Répondre aux questions des clients sous 24 à 48 heures.</li>
          <li><strong>Transparence :</strong> Les descriptions de produits doivent être honnêtes et précises.</li>
        </ul>

        <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">3. Politique d'évaluation</h2>
        <p className="text-text-secondary mb-6">
          Il est interdit d'inciter les acheteurs à laisser de faux avis positifs ou de proposer des compensations en échange de la suppression d'avis négatifs.
        </p>
      </Card>
    </div>
  );
}
