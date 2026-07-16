import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, MoreVertical, Shield, User as UserIcon, Store, FileText, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  verification_status?: string;
  verification_documents?: any;
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKycAction = async (userId: string, status: 'verified' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verification_status: status })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, verification_status: status } : u));
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating KYC status:', err);
      alert('Failed to update KYC status');
    }
  };

  const filteredUsers = users.filter(user => 
    `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-error" />;
      case 'seller': return <Store className="h-4 w-4 text-accent" />;
      default: return <UserIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <span className="px-2 py-1 bg-error/10 text-error rounded-md text-xs font-medium">Administrateur</span>;
      case 'seller': return <span className="px-2 py-1 bg-accent/10 text-accent rounded-md text-xs font-medium">Vendeur</span>;
      default: return <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md text-xs font-medium">Acheteur</span>;
    }
  };
  
  const getKycBadge = (status?: string) => {
    switch (status) {
      case 'verified': return <span className="px-2 py-1 bg-success/10 text-success rounded-md text-xs font-medium">Vérifié</span>;
      case 'pending': return <span className="px-2 py-1 bg-warning/10 text-warning-dark rounded-md text-xs font-medium">En attente</span>;
      case 'rejected': return <span className="px-2 py-1 bg-danger/10 text-danger rounded-md text-xs font-medium">Rejeté</span>;
      default: return <span className="px-2 py-1 bg-surface text-text-secondary rounded-md text-xs font-medium">Non vérifié</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Utilisateurs & KYC</h1>
          <p className="text-text-secondary mt-1">Gérez les comptes et vérifiez l'identité des vendeurs.</p>
        </div>
        
        <div className="w-full sm:w-auto">
          <Input
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            iconLeft={<Search className="h-5 w-5" />}
            className="w-full sm:w-64"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover border-b border-border-light">
                <th className="p-4 font-medium text-text-secondary text-sm">Utilisateur</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Rôle</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Statut KYC</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Inscription</th>
                <th className="p-4 font-medium text-text-secondary text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    Chargement des utilisateurs...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-border-light flex items-center justify-center">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">
                            {user.first_name || 'Utilisateur'} {user.last_name || ''}
                          </p>
                          <p className="text-xs text-text-secondary">{user.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-4">
                      {getKycBadge(user.verification_status)}
                    </td>
                    <td className="p-4 text-sm text-text-secondary">
                      {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: fr })}
                    </td>
                    <td className="p-4 text-right">
                      {user.verification_status === 'pending' && user.verification_documents && (
                        <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)} className="mr-2">
                          Examiner KYC
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="p-2">
                        <MoreVertical className="h-5 w-5 text-text-secondary" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* KYC Review Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-text-primary mb-4">Examen KYC - {selectedUser.first_name} {selectedUser.last_name}</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Carte d'identité (Recto)</h3>
                {selectedUser.verification_documents?.cniFront ? (
                  <img src={selectedUser.verification_documents.cniFront} alt="CNI Recto" className="w-full rounded-lg border border-border-light" />
                ) : <p className="text-sm text-text-tertiary">Non fourni</p>}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Carte d'identité (Verso)</h3>
                {selectedUser.verification_documents?.cniBack ? (
                  <img src={selectedUser.verification_documents.cniBack} alt="CNI Verso" className="w-full rounded-lg border border-border-light" />
                ) : <p className="text-sm text-text-tertiary">Non fourni</p>}
              </div>
              
              {selectedUser.verification_documents?.companyDoc && (
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-2">Document d'entreprise</h3>
                  <a href={selectedUser.verification_documents.companyDoc} target="_blank" rel="noreferrer" className="flex items-center p-3 border border-border-light rounded-lg text-accent hover:bg-surface">
                    <FileText className="h-5 w-5 mr-2" />
                    Voir le document
                  </a>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border-light">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Fermer
              </Button>
              <Button variant="outline" className="text-danger border-danger hover:bg-danger/10" onClick={() => handleKycAction(selectedUser.id, 'rejected')}>
                <XCircle className="h-4 w-4 mr-2" /> Rejeter
              </Button>
              <Button onClick={() => handleKycAction(selectedUser.id, 'verified')} className="bg-success hover:bg-success-dark text-white">
                <CheckCircle className="h-4 w-4 mr-2" /> Approuver
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
