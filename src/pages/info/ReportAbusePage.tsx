import { Card } from '../../components/ui/Card';
import { AlertTriangle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function ReportAbusePage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Signaler un abus</h1>
      </div>
      
      <Card className="p-8">
        <p className="text-text-secondary mb-8">
          Aidez-nous à maintenir un environnement sûr. Utilisez ce formulaire pour signaler un produit interdit, un comportement frauduleux ou une violation de propriété intellectuelle.
        </p>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Type d'abus *</label>
            <select className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all">
              <option value="">Sélectionnez une option</option>
              <option value="fake">Produit contrefait</option>
              <option value="scam">Fraude ou escroquerie</option>
              <option value="ip">Violation de propriété intellectuelle</option>
              <option value="content">Contenu inapproprié</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <Input 
            label="Lien (URL) de l'élément signalé *" 
            placeholder="https://mercaply.com/..." 
            required
          />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Description détaillée *</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all min-h-[120px]"
              placeholder="Veuillez décrire le problème avec autant de détails que possible..."
              required
            ></textarea>
          </div>
          
          <Input 
            label="Votre adresse email (pour le suivi)" 
            type="email"
            placeholder="email@exemple.com"
          />

          <Button type="button" className="w-full py-4 text-lg">
            Envoyer le signalement
          </Button>
        </form>
      </Card>
    </div>
  );
}
