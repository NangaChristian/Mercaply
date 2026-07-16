import { Card } from '../../components/ui/Card';
import { Info } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
          <Info className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Qui sommes-nous ?</h1>
      </div>
      
      <Card className="p-8 prose prose-gray max-w-none">
        <p className="text-lg text-text-secondary leading-relaxed mb-6">
          MERCAPLY est la plateforme de commerce en ligne leader dédiée à connecter les acheteurs et les vendeurs à travers toute la région. Notre mission est de simplifier les échanges commerciaux en offrant un environnement sûr, rapide et fiable pour tous.
        </p>
        
        <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">Notre Vision</h2>
        <p className="text-text-secondary leading-relaxed mb-6">
          Devenir la référence incontournable du e-commerce local, en valorisant les commerçants de proximité tout en offrant aux consommateurs un accès facile à une large gamme de produits et services de qualité.
        </p>

        <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">Nos Valeurs</h2>
        <ul className="list-disc pl-5 text-text-secondary space-y-2 mb-6">
          <li><strong>Transparence :</strong> Nous croyons en des échanges clairs et honnêtes.</li>
          <li><strong>Sécurité :</strong> La protection de nos utilisateurs est notre priorité absolue.</li>
          <li><strong>Proximité :</strong> Soutenir l'économie locale et les petits commerçants.</li>
          <li><strong>Innovation :</strong> Améliorer continuellement notre plateforme pour une meilleure expérience.</li>
        </ul>
      </Card>
    </div>
  );
}
