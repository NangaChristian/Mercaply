const fs = require('fs');
let content = fs.readFileSync('src/pages/buyer/BuyerProfilePage.tsx', 'utf-8');

const targetStr = `            <button className="w-full py-2.5 px-4 bg-surface text-text-primary text-sm font-medium rounded-xl hover:bg-border-light transition-colors text-left">
              Activer l'A2F
            </button>
          </div>
        </div>`;

const replaceStr = `            <button className="w-full py-2.5 px-4 bg-surface text-text-primary text-sm font-medium rounded-xl hover:bg-border-light transition-colors text-left">
              Activer l'A2F
            </button>
            <div className="pt-4 border-t border-border-light mt-4">
              <button onClick={async () => { await supabase.auth.signOut(); window.location.href='/'; }} className="w-full py-3 px-4 bg-danger/10 text-danger text-sm font-bold rounded-xl hover:bg-danger/20 transition-colors flex items-center justify-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>`;

content = content.replace(targetStr, replaceStr);

// Ensure name is read correctly if User
content = content.replace("const names = ['User'];", "const names = user?.user_metadata?.full_name ? user.user_metadata.full_name.split(' ') : ['User'];");

fs.writeFileSync('src/pages/buyer/BuyerProfilePage.tsx', content, 'utf-8');
