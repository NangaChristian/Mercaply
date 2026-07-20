import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../store/useToast';
import { Key, Link, Mail, Server, Power, PowerOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../utils/cn';

export function AdminIntegrations() {
  const { addToast } = useToast();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (id: string, updates: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/integrations/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Update failed');
      addToast('success', 'Intégration mise à jour avec succès');
      fetchSettings();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleToggle = (integration: any) => {
    handleUpdate(integration.id, { isActive: !integration.isActive });
  };

  const handleConfigChange = (integrationId: string, key: string, value: string) => {
    setIntegrations(prev => prev.map(int => {
      if (int.id === integrationId) {
        return { ...int, config: { ...int.config, [key]: value } };
      }
      return int;
    }));
  };

  const handleSaveConfig = (integration: any) => {
    handleUpdate(integration.id, { config: integration.config });
  };

  if (isLoading) return <div className="p-4 text-center">Chargement des intégrations...</div>;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Key className="h-6 w-6 text-blue-500" />
        <h2 className="text-lg font-bold text-text-primary">Clés API & Intégrations</h2>
      </div>
      
      <div className="space-y-8">
        {integrations.map((int) => (
          <div key={int.id} className="p-4 border border-border-light rounded-xl bg-surface/30">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-light">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  int.isActive ? "bg-success/10 text-success" : "bg-surface-hover text-text-tertiary"
                )}>
                  {int.type === 'payment' ? <Link className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary">{int.provider}</h3>
                  <p className="text-sm text-text-secondary">{int.type === 'payment' ? 'Passerelle de paiement' : 'Service Email'}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className={int.isActive ? "border-danger text-danger hover:bg-danger/10" : "border-success text-success hover:bg-success/10"}
                onClick={() => handleToggle(int)}
              >
                {int.isActive ? (
                  <><PowerOff className="h-4 w-4 mr-2" /> Désactiver</>
                ) : (
                  <><Power className="h-4 w-4 mr-2" /> Activer</>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {int.id === 'fapshi' && (
                <>
                  <Input 
                    label="Fapshi API User" 
                    value={int.config.apiUser} 
                    onChange={(e) => handleConfigChange(int.id, 'apiUser', e.target.value)} 
                  />
                  <Input 
                    label="Fapshi API Key" 
                    type="password"
                    value={int.config.apiKey} 
                    onChange={(e) => handleConfigChange(int.id, 'apiKey', e.target.value)} 
                  />
                  <Input 
                    label="Base URL (Sandbox/Prod)" 
                    value={int.config.baseUrl} 
                    onChange={(e) => handleConfigChange(int.id, 'baseUrl', e.target.value)} 
                  />
                </>
              )}
              {int.id === 'smtp_hostinger' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Serveur SMTP" 
                      value={int.config.host} 
                      onChange={(e) => handleConfigChange(int.id, 'host', e.target.value)} 
                    />
                    <Input 
                      label="Port" 
                      type="number"
                      value={int.config.port} 
                      onChange={(e) => handleConfigChange(int.id, 'port', e.target.value)} 
                    />
                  </div>
                  <Input 
                    label="Email Expéditeur (From)" 
                    value={int.config.from} 
                    onChange={(e) => handleConfigChange(int.id, 'from', e.target.value)} 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Utilisateur SMTP" 
                      value={int.config.user} 
                      onChange={(e) => handleConfigChange(int.id, 'user', e.target.value)} 
                    />
                    <Input 
                      label="Mot de passe SMTP" 
                      type="password"
                      value={int.config.pass} 
                      onChange={(e) => handleConfigChange(int.id, 'pass', e.target.value)} 
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end pt-2">
                <Button size="sm" onClick={() => handleSaveConfig(int)}>
                  Enregistrer les identifiants
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
