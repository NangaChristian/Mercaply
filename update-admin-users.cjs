const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminUsersPage.tsx', 'utf-8');

// Update imports
content = content.replace("import { Search, MoreVertical, Shield, User as UserIcon, Store, FileText, CheckCircle, XCircle } from 'lucide-react';", 
"import { Search, MoreVertical, Shield, User as UserIcon, Store, FileText, CheckCircle, XCircle, Ban, Power, Trash2, Edit } from 'lucide-react';\nimport { useToast } from '../../store/useToast';");

// Update Profile interface
content = content.replace("verification_documents?: any;\n}", "verification_documents?: any;\n  email?: string;\n  status?: string;\n  is_banned?: boolean;\n}");

// Add useToast
content = content.replace("const [selectedUser, setSelectedUser] = useState<Profile | null>(null);", 
"const [selectedUser, setSelectedUser] = useState<Profile | null>(null);\n  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);\n  const { addToast } = useToast();");

// Update fetchUsers
const newFetchUsers = `async function fetchUsers() {
    if (!supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': \`Bearer \${session?.access_token}\` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setUsers(data);
    } finally {
      setIsLoading(false);
    }
  }`;

content = content.replace(/async function fetchUsers\(\) \{[\s\S]+?\}\n  \}/, newFetchUsers);

// Add action handlers
const actionHandlers = `
  const handleAction = async (userId: string, action: string, value: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(\`/api/admin/users/\${userId}/\${action}\`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 
          'Authorization': \`Bearer \${session?.access_token}\`,
          'Content-Type': 'application/json'
        },
        body: action !== 'delete' ? JSON.stringify(value) : undefined
      });
      if (!response.ok) throw new Error('Action failed');
      addToast('success', 'Opération réussie');
      fetchUsers();
    } catch (err: any) {
      addToast('error', err.message);
    }
    setShowActionsMenu(null);
  };
`;

content = content.replace("const handleKycAction", actionHandlers + "\n  const handleKycAction");

// Add status column to table header
content = content.replace('<th className="p-4 font-medium text-text-secondary text-sm">Rôle</th>', 
  '<th className="p-4 font-medium text-text-secondary text-sm">Rôle</th>\n<th className="p-4 font-medium text-text-secondary text-sm">Compte</th>');

// Add status rendering in table body
const userRowReplacement = `<td className="p-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-4">
                      {user.is_banned ? (
                        <span className="px-2 py-1 bg-danger/10 text-danger rounded-md text-xs font-medium">Banni</span>
                      ) : user.status === 'disabled' ? (
                        <span className="px-2 py-1 bg-warning/10 text-warning-dark rounded-md text-xs font-medium">Désactivé</span>
                      ) : (
                        <span className="px-2 py-1 bg-success/10 text-success rounded-md text-xs font-medium">Actif</span>
                      )}
                    </td>
                    <td className="p-4">`;
content = content.replace(/<td className="p-4">\s*\{getRoleBadge\(user\.role\)\}\s*<\/td>\s*<td className="p-4">/, userRowReplacement);

// Add actions menu in the last column
const actionsMenu = `<div className="relative inline-block">
                        <Button variant="ghost" size="sm" className="p-2" onClick={() => setShowActionsMenu(showActionsMenu === user.id ? null : user.id)}>
                          <MoreVertical className="h-5 w-5 text-text-secondary" />
                        </Button>
                        {showActionsMenu === user.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-background border border-border-light rounded-xl shadow-lg z-10 py-1">
                            <button onClick={() => handleAction(user.id, 'role', { role: user.role === 'seller' ? 'buyer' : 'seller' })} className="w-full text-left px-4 py-2 text-sm hover:bg-surface flex items-center">
                              <Edit className="h-4 w-4 mr-2" /> Changer rôle ({user.role === 'seller' ? 'Acheteur' : 'Vendeur'})
                            </button>
                            <button onClick={() => handleAction(user.id, 'ban', { is_banned: !user.is_banned })} className="w-full text-left px-4 py-2 text-sm hover:bg-surface flex items-center text-warning-dark">
                              <Ban className="h-4 w-4 mr-2" /> {user.is_banned ? 'Débannir' : 'Bannir'}
                            </button>
                            <button onClick={() => handleAction(user.id, 'status', { status: user.status === 'disabled' ? 'active' : 'disabled' })} className="w-full text-left px-4 py-2 text-sm hover:bg-surface flex items-center">
                              <Power className="h-4 w-4 mr-2" /> {user.status === 'disabled' ? 'Activer' : 'Désactiver'}
                            </button>
                            <button onClick={() => { if(confirm('Êtes-vous sûr?')) handleAction(user.id, 'delete', null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-surface flex items-center text-danger">
                              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                            </button>
                          </div>
                        )}
                      </div>`;

content = content.replace(/<Button variant="ghost" size="sm" className="p-2">\s*<MoreVertical className="h-5 w-5 text-text-secondary" \/>\s*<\/Button>/, actionsMenu);

content = content.replace("{user.id.substring(0, 8)}...", "{user.email || user.id.substring(0, 8)}");

fs.writeFileSync('src/pages/admin/AdminUsersPage.tsx', content);
