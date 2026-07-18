import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../store/useToast';
import { Settings, ShieldAlert, Key } from 'lucide-react';
import { AdminShippingZones } from '../../components/admin/AdminShippingZones';

export function AdminSettingsPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    platformName: 'Mercaply',
    contactEmail: 'admin@mercaply.com',
    stripeKey: 'sk_test_123456789'
  });

  useEffect(() => {
    const saved = localStorage.getItem('admin_platform_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse settings');
      }
    }
  }, []);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('admin_platform_settings', JSON.stringify(settings));
      setIsLoading(false);
      addToast('success', 'Paramètres enregistrés avec succès');
    }, 800);
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Paramètres</h1>
        <p className="text-text-secondary mt-1">Configurez les paramètres globaux de la plateforme.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AdminShippingZones />

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="h-6 w-6 text-accent" />
            <h2 className="text-lg font-bold text-text-primary">Général</h2>
          </div>
          
          <div className="space-y-4">
            <Input 
              label="Nom de la plateforme" 
              value={settings.platformName}
              onChange={(e) => handleChange('platformName', e.target.value)}
            />
            <Input 
              label="Email de contact principal" 
              value={settings.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg font-bold text-text-primary">Sécurité</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-hover rounded-xl border border-border-light">
              <div>
                <p className="font-medium text-text-primary">Authentification à deux facteurs</p>
                <p className="text-sm text-text-secondary">Obligatoire pour tous les administrateurs</p>
              </div>
              <Button variant="outline" size="sm">Configurer</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-hover rounded-xl border border-border-light">
              <div>
                <p className="font-medium text-text-primary">Changer le mot de passe</p>
                <p className="text-sm text-text-secondary">Dernière modification il y a 30 jours</p>
              </div>
              <Button variant="outline" size="sm">Modifier</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Key className="h-6 w-6 text-blue-500" />
            <h2 className="text-lg font-bold text-text-primary">Clés API & Intégrations</h2>
          </div>
          
          <div className="space-y-4">
             <Input 
               label="Clé Stripe (Paiements)" 
               type="password"
               value={settings.stripeKey}
               onChange={(e) => handleChange('stripeKey', e.target.value)}
             />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={isLoading}>
            Enregistrer les modifications
          </Button>
        </div>
      </div>
    </div>
  );
}
