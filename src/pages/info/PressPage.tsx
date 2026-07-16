import { Card } from '../../components/ui/Card';
import { Newspaper } from 'lucide-react';

export function PressPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
          <Newspaper className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Presse</h1>
      </div>
      
      <Card className="p-8">
        <p className="text-text-secondary leading-relaxed mb-6">
          Découvrez les dernières actualités de MERCAPLY, nos communiqués de presse et les mentions dans les médias.
        </p>
        
        <div className="space-y-6">
          <div className="border-b border-gray-100 pb-6">
            <span className="text-sm text-gray-500 font-medium">10 Juillet 2026</span>
            <h3 className="text-lg font-bold text-text-primary mt-1 mb-2">Lancement de MERCAPLY dans de nouvelles régions</h3>
            <p className="text-text-secondary text-sm">MERCAPLY annonce son expansion pour couvrir davantage de villes, soutenant ainsi des centaines de nouveaux vendeurs locaux.</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <h3 className="text-lg font-bold text-text-primary mb-4">Contact Presse</h3>
          <p className="text-text-secondary">
            Pour toute demande d'interview ou d'information, contactez notre équipe à <strong>presse@mercaply.com</strong>.
          </p>
        </div>
      </Card>
    </div>
  );
}
