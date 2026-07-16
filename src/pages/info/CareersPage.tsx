import { Card } from '../../components/ui/Card';
import { Briefcase } from 'lucide-react';

export function CareersPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Carrières</h1>
      </div>
      
      <Card className="p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Rejoignez l'équipe MERCAPLY</h2>
          <p className="text-text-secondary mb-8">
            Nous sommes toujours à la recherche de talents passionnés pour nous aider à transformer le commerce local.
          </p>
          <div className="bg-gray-50 rounded-xl p-8 max-w-lg mx-auto">
            <p className="text-text-secondary">
              Aucun poste n'est ouvert pour le moment, mais n'hésitez pas à nous envoyer une candidature spontanée à <strong>recrutement@mercaply.com</strong>.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
