import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, MoreVertical, Briefcase, Trash2 } from 'lucide-react';
import { AdminActionModal } from '../../components/admin/AdminActionModal';
import { useToast } from '../../store/useToast';
import { logAdminAction } from '../../utils/adminAudit';

interface ServiceData {
  id: string;
  title: string;
  price: number;
  price_type: string;
  category: string;
}

export function AdminServicesPage() {
  const { addToast } = useToast();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        if (data) setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchServices();
  }, []);

  const handleDeleteService = (reason: string) => {
    // Implement deletion logic here
    if (serviceToDelete) {
      logAdminAction('delete_service', serviceToDelete, reason);
    }
    addToast('success', `Le service a été supprimé. Raison: ${reason}`);
    setServiceToDelete(null);
  };

  const filteredServices = services.filter(service => 
    service.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Services</h1>
          <p className="text-text-secondary mt-1">Gérez le catalogue des services.</p>
        </div>
        
        <div className="w-full sm:w-auto">
          <Input
            placeholder="Rechercher un service..."
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
                <th className="p-4 font-medium text-text-secondary text-sm">Service</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Catégorie</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Prix</th>
                <th className="p-4 font-medium text-text-secondary text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-secondary">
                    Chargement des services...
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-secondary">
                    Aucun service trouvé.
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-surface-hover transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-purple-500" />
                        </div>
                        <p className="font-medium text-text-primary">{service.title}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-text-secondary">{service.category || 'N/A'}</span>
                    </td>
                    <td className="p-4 font-medium">{service.price.toLocaleString()} CFA {service.price_type === 'hourly' ? '/ heure' : service.price_type === 'starting_at' ? 'à partir de' : ''}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-2 text-error hover:bg-error/10"
                          onClick={() => setServiceToDelete(service.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <MoreVertical className="h-5 w-5 text-text-secondary" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AdminActionModal
        isOpen={!!serviceToDelete}
        onClose={() => setServiceToDelete(null)}
        onConfirm={handleDeleteService}
        title="Supprimer le service"
        description="Cette action est irréversible. Le service sera définitivement retiré de la plateforme."
        actionLabel="Supprimer"
        isDestructive={true}
      />
    </div>
  );
}
