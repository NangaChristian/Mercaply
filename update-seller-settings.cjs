const fs = require('fs');
let content = fs.readFileSync('src/pages/seller/SellerSettingsPage.tsx', 'utf-8');

// Add import
content = content.replace("import { useAuth } from '../../store/useAuth';", "import { useAuth } from '../../store/useAuth';\nimport { MfaSetup } from '../../components/auth/MfaSetup';");

const tabsReplacement = `        {/* Settings Navigation */}
        <div className="md:col-span-1 space-y-1">
          <button onClick={() => setActiveTab('profile')} className={\`w-full flex items-center px-4 py-3 font-medium rounded-xl transition-colors \${activeTab === 'profile' ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}\`}>
            <User className="h-5 w-5 mr-3" /> Profil vendeur
          </button>
          <button onClick={() => setActiveTab('security')} className={\`w-full flex items-center px-4 py-3 font-medium rounded-xl transition-colors \${activeTab === 'security' ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}\`}>
            <Shield className="h-5 w-5 mr-3" /> Sécurité
          </button>
        </div>`;

content = content.replace(/\{\/\* Settings Navigation \*\/\}([\s\S]+?)<\/div>/, tabsReplacement);
content = content.replace("const [isSaving, setIsSaving] = useState(false);", "const [isSaving, setIsSaving] = useState(false);\n  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');");

const rightColRegex = /\{\/\* Settings Content \*\/\}([\s\S]+?)<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/;
const newRightCol = `{/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === 'profile' ? (
            <>
              {/* Verification Banner */}
              {verification_status === 'unverified' && (
                <div className="bg-warning/10 border border-warning/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-warning flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-warning-dark">Vérification de la boutique requise</h3>
                      <p className="text-sm text-warning-dark/80 mt-1 max-w-lg">
                        Pour vendre sur la plateforme et recevoir des paiements, vous devez fournir vos documents d'identité et les informations légales de votre entreprise.
                      </p>
                    </div>
                  </div>
                  <Link to="/seller/verification" className="whitespace-nowrap px-4 py-2 bg-warning text-white font-medium rounded-xl hover:bg-warning-dark transition-colors">
                    Soumettre mes documents
                  </Link>
                </div>
              )}

              {verification_status === 'pending' && (
                <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 flex items-center gap-4">
                  <Shield className="h-6 w-6 text-accent flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Documents en cours d'examen</h3>
                    <p className="text-sm text-text-secondary mt-1">Vos documents sont en cours de validation par notre équipe.</p>
                  </div>
                </div>
              )}

              {verification_status === 'verified' && (
                 <div className="bg-success/10 border border-success/20 rounded-2xl p-6 flex items-center gap-4">
                  <ShieldCheck className="h-6 w-6 text-success flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-success-dark">Boutique vérifiée</h3>
                    <p className="text-sm text-success-dark/80 mt-1">Vos documents ont été validés avec succès.</p>
                  </div>
                </div>
              )}

              <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm">
                <h2 className="text-lg font-bold text-text-primary mb-6">Informations du représentant légal</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Nom</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="ex: Dupont" 
                      className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Prénom</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="ex: Jean" 
                      className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" 
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Numéro de CNI / Passeport</label>
                    <input 
                      type="text" 
                      name="cniNumber"
                      value={formData.cniNumber}
                      onChange={handleChange}
                      placeholder="ex: 123456789" 
                      className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Numéro de Registre de Commerce (Optionnel)</label>
                    <input 
                      type="text" 
                      name="rcNumber"
                      value={formData.rcNumber}
                      onChange={handleChange}
                      placeholder="RC/DLA/2026/B/1234" 
                      className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-2xl border border-border-light p-6 shadow-sm">
                <h2 className="text-lg font-bold text-text-primary mb-6">Politiques de la boutique</h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Politique de retour</label>
                    <textarea 
                      rows={3} 
                      name="returnPolicy"
                      value={formData.returnPolicy}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Conditions de garantie</label>
                    <textarea 
                      rows={3} 
                      name="warrantyPolicy"
                      value={formData.warrantyPolicy}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-surface border border-border-light rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none" 
                    />
                  </div>
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

fs.writeFileSync('src/pages/seller/SellerSettingsPage.tsx', content, 'utf-8');
