import { Card } from '../../components/ui/Card';
import { Shield } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Politique de confidentialité</h1>
      </div>
      
      <Card className="p-8 prose prose-gray max-w-none">
        <p className="text-sm text-gray-500 mb-6">Dernière mise à jour : 10 Juillet 2026</p>
        
        <p className="text-text-secondary mb-6">
          Chez MERCAPLY, nous prenons la protection de vos données personnelles très au sérieux. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
        </p>

        <h2 className="text-xl font-bold text-text-primary mb-4">Informations collectées</h2>
        <ul className="list-disc pl-5 text-text-secondary space-y-2 mb-6">
          <li>Informations de compte (nom, email, numéro de téléphone)</li>
          <li>Adresses de livraison et de facturation</li>
          <li>Historique des commandes et des paiements</li>
          <li>Données de navigation sur notre plateforme</li>
        </ul>

        <h2 className="text-xl font-bold text-text-primary mb-4">Utilisation des données</h2>
        <p className="text-text-secondary mb-6">
          Vos données sont utilisées pour traiter vos commandes, améliorer notre service client, personnaliser votre expérience et vous informer des offres pertinentes (si vous avez accepté de les recevoir).
        </p>

        <h2 className="text-xl font-bold text-text-primary mb-4">Vos droits</h2>
        <p className="text-text-secondary mb-6">
          Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous via notre formulaire de support.
        </p>
      </Card>
    </div>
  );
}
