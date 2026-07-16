import { Card } from '../../components/ui/Card';
import { Scale } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
          <Scale className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Conditions d'utilisation</h1>
      </div>
      
      <Card className="p-8 prose prose-gray max-w-none">
        <p className="text-sm text-gray-500 mb-6">Dernière mise à jour : 10 Juillet 2026</p>
        
        <h2 className="text-xl font-bold text-text-primary mb-4">1. Acceptation des conditions</h2>
        <p className="text-text-secondary mb-6">
          En accédant et en utilisant la plateforme MERCAPLY, vous acceptez d'être lié par les présentes conditions générales d'utilisation.
        </p>

        <h2 className="text-xl font-bold text-text-primary mb-4">2. Utilisation du service</h2>
        <p className="text-text-secondary mb-6">
          Vous devez avoir au moins 18 ans pour créer un compte. Vous êtes responsable de la confidentialité de votre compte et de votre mot de passe.
        </p>

        <h2 className="text-xl font-bold text-text-primary mb-4">3. Contenu utilisateur</h2>
        <p className="text-text-secondary mb-6">
          Vous conservez les droits sur le contenu que vous publiez, mais vous accordez à MERCAPLY une licence pour utiliser, afficher et distribuer ce contenu sur la plateforme.
        </p>

        <h2 className="text-xl font-bold text-text-primary mb-4">4. Limitation de responsabilité</h2>
        <p className="text-text-secondary mb-6">
          MERCAPLY agit en tant qu'intermédiaire entre acheteurs et vendeurs et ne peut être tenu responsable des litiges entre utilisateurs, bien que nous proposions des services de médiation.
        </p>
      </Card>
    </div>
  );
}
