import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../store/useToast';
import { Settings, ShieldAlert, Key, Percent } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdminShippingZones } from '../../components/admin/AdminShippingZones';
import { AdminIntegrations } from '../../components/admin/AdminIntegrations';

export function AdminSettingsPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState({
    platformName: 'Mercaply',
    contactEmail: 'admin@mercaply.com',
    stripeKey: 'sk_test_123456789'
  });
  const [commission, setCommission] = useState(5.0);

    useEffect(() => {
    const saved = localStorage.getItem('admin_platform_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {}
    }
    fetchAdminSettings();
  }, []);

  const fetchAdminSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.commission_percentage !== undefined) {
          setCommission(data.commission_percentage);
        }
      }
    } catch(err) {}
  };

    const handleSave = async () => {
    setIsLoading(true);
    localStorage.setItem('admin_platform_settings', JSON.stringify(settings));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ commission_percentage: commission })
      });
      addToast('success', 'Paramètres enregistrés avec succès');
    } catch (err: any) {
      addToast('error', 'Erreur lors de la sauvegarde: ' + err.message);
    }
    setIsLoading(false);
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
        <Card className="p-6 border-accent/20">
          <div className="flex items-center gap-3 mb-6">
            <Percent className="h-6 w-6 text-accent" />
            <h2 className="text-lg font-bold text-text-primary">Paramètres financiers (Commissions)</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Pourcentage de commission global (%)</label>
              <div className="relative max-w-sm">
                <Input 
                  type="number" 
                  step="0.1"
                  min="0"
                  max="100"
                  value={commission}
                  onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
                  className="pr-10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium">%</span>
              </div>
              <p className="text-xs text-text-tertiary mt-2">
                Ce pourcentage sera prélevé sur chaque vente réussie avant de reverser le reste au vendeur.
              </p>
            </div>
            
            <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 flex items-center justify-between">
              <div>
                <p className="font-bold text-text-primary">Tableau de bord des paiements & Payouts</p>
                <p className="text-sm text-text-secondary">Gérez les transferts d'argent vers les vendeurs (via Fapshi).</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.alert('Payout manager non implémenté dans cette vue, voir section dédiée')}>Gérer les paiements</Button>
            </div>
          </div>
        </Card>

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

        <AdminIntegrations />

        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={isLoading}>
            Enregistrer les modifications
          </Button>
        </div>
      </div>
    </div>
  );
}
