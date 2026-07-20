const fs = require('fs');
let content = fs.readFileSync('src/pages/buyer/BuyerProfilePage.tsx', 'utf-8');

// Add import
content = content.replace("import { useToast } from '../../store/useToast';", "import { useToast } from '../../store/useToast';\nimport { MfaSetup } from '../../components/auth/MfaSetup';");
content = content.replace("const [isSaving, setIsSaving] = useState(false);", "const [isSaving, setIsSaving] = useState(false);\n  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');");

const rightColRegex = /\{\/\* Right Column: Forms \*\/\}([\s\S]+?)<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/;

const newRightCol = `{/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === 'profile' ? (
            <>
              {/* Personal Info Form */}
              <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm">
                <h2 className="font-bold text-text-primary mb-6">Informations personnelles</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">Prénom</label>
                      <input 
                        type="text" 
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">Nom</label>
                      <input 
                        type="text" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Adresse Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-2.5 bg-surface-2 border border-border-light rounded-xl text-sm text-text-tertiary cursor-not-allowed"
                    />
                    <p className="text-xs text-text-tertiary mt-1">L'adresse email ne peut pas être modifiée.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">Téléphone</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">Région principale</label>
                      <select 
                        value={formData.region}
                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                        className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                      >
                        {CAMEROON_REGIONS.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center px-6 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-70"
                    >
                      {isSaving ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Enregistrer les modifications
                    </button>
                  </div>
                </form>
              </div>

              {/* Notifications Preferences */}
              <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm">
                <h2 className="font-bold text-text-primary mb-6 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-text-tertiary" />
                  Préférences de notification
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Mises à jour de commande (Email)</p>
                      <p className="text-xs text-text-secondary">Recevez des emails sur l'état de vos commandes.</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={notifications.emailOrders} onChange={(e) => setNotifications({...notifications, emailOrders: e.target.checked})} />
                      <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Promotions et offres (Email)</p>
                      <p className="text-xs text-text-secondary">Recevez nos meilleures offres et nouveautés.</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={notifications.emailPromos} onChange={(e) => setNotifications({...notifications, emailPromos: e.target.checked})} />
                      <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Alertes de livraison (SMS)</p>
                      <p className="text-xs text-text-secondary">Soyez notifié par SMS le jour de la livraison.</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={notifications.smsDelivery} onChange={(e) => setNotifications({...notifications, smsDelivery: e.target.checked})} />
                      <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                    </div>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <MfaSetup />
          )}
        </div>
      </div>
    </div>
  );
}`;

content = content.replace(rightColRegex, newRightCol);

content = content.replace(
  /<button className="w-full py-2.5 px-4 bg-surface text-text-primary text-sm font-medium rounded-xl hover:bg-border-light transition-colors text-left">[\s\S]*?Activer l'A2F[\s\S]*?<\/button>/,
  `<button onClick={() => setActiveTab('security')} className={\`w-full py-2.5 px-4 text-sm font-medium rounded-xl transition-colors text-left \${activeTab === 'security' ? 'bg-accent/10 text-accent' : 'bg-surface text-text-primary hover:bg-border-light'}\`}>
    Activer l'A2F
  </button>`
);

content = content.replace(
  /<button className="w-full py-2.5 px-4 bg-surface text-text-primary text-sm font-medium rounded-xl hover:bg-border-light transition-colors text-left">[\s\S]*?Modifier le profil[\s\S]*?<\/button>/,
  `<button onClick={() => setActiveTab('profile')} className={\`w-full py-2.5 px-4 text-sm font-medium rounded-xl transition-colors text-left \${activeTab === 'profile' ? 'bg-accent/10 text-accent' : 'bg-surface text-text-primary hover:bg-border-light'}\`}>
    Modifier le profil
  </button>`
);

fs.writeFileSync('src/pages/buyer/BuyerProfilePage.tsx', content, 'utf-8');
