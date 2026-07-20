const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminSettingsPage.tsx', 'utf-8');

// Update imports
content = content.replace("import { Settings, ShieldAlert, Key } from 'lucide-react';", "import { Settings, ShieldAlert, Key, Percent } from 'lucide-react';\nimport { supabase } from '../../lib/supabase';");

// Add commission to state
const stateReplacement = `  const [settings, setSettings] = useState({
    platformName: 'Mercaply',
    contactEmail: 'admin@mercaply.com',
    stripeKey: 'sk_test_123456789'
  });
  const [commission, setCommission] = useState(5.0);`;
content = content.replace(/const \[settings, setSettings\] = useState\(\{[\s\S]*?\}\);/, stateReplacement);

// Fetch settings from API in useEffect
const useEffectReplacement = `  useEffect(() => {
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
        headers: { 'Authorization': \`Bearer \${session?.access_token}\` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.commission_percentage !== undefined) {
          setCommission(data.commission_percentage);
        }
      }
    } catch(err) {}
  };`;
content = content.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/, useEffectReplacement);

// Handle save to include saving commission
const saveReplacement = `  const handleSave = async () => {
    setIsLoading(true);
    localStorage.setItem('admin_platform_settings', JSON.stringify(settings));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 
          'Authorization': \`Bearer \${session?.access_token}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ commission_percentage: commission })
      });
      addToast('success', 'Paramètres enregistrés avec succès');
    } catch (err: any) {
      addToast('error', 'Erreur lors de la sauvegarde: ' + err.message);
    }
    setIsLoading(false);
  };`;
content = content.replace(/const handleSave = \(\) => \{[\s\S]*?\};/, saveReplacement);

// Add Financial settings block before General
const financialBlock = `
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
`;
content = content.replace('<div className="grid grid-cols-1 gap-6">', '<div className="grid grid-cols-1 gap-6">' + financialBlock);

fs.writeFileSync('src/pages/admin/AdminSettingsPage.tsx', content);
