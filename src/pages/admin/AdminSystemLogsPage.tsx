import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, Activity, AlertTriangle, Info, ShieldAlert, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '../../store/useToast';

interface SystemLog {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  source: string;
  timestamp: string;
}

const mockLogs: SystemLog[] = [
  { id: '1', type: 'critical', message: 'Tentative de connexion échouée (10x) pour l\'admin', source: 'Auth Service', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: '2', type: 'warning', message: 'Boutique "TechStore" a dépassé sa limite de produits', source: 'Product Service', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: '3', type: 'info', message: 'Nouvelle inscription vendeur : "BioCosmetics"', source: 'User Service', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: '4', type: 'error', message: 'Échec de paiement (Stripe timeout)', source: 'Payment Gateway', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: '5', type: 'info', message: 'Sauvegarde de la base de données terminée avec succès', source: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
  { id: '6', type: 'warning', message: 'Utilisation de l\'API élevée (85% du quota)', source: 'API Gateway', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

export function AdminSystemLogsPage() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  
  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesDate = filterDate === '' || log.timestamp.startsWith(filterDate);
    
    return matchesSearch && matchesType && matchesDate;
  });

  const handleDownloadReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Niveau,Source,Message,Date\n"
      + filteredLogs.map(log => `${log.type},${log.source},"${log.message}",${log.timestamp}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "system_health_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Rapport téléchargé avec succès');
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'error': return <ShieldAlert className="h-5 w-5 text-danger" />;
      case 'critical': return <ShieldAlert className="h-5 w-5 text-purple-600" />;
      default: return <Activity className="h-5 w-5 text-text-secondary" />;
    }
  };

  const getLogBadgeClass = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-500/10 text-blue-500';
      case 'warning': return 'bg-orange-500/10 text-orange-500';
      case 'error': return 'bg-danger/10 text-danger';
      case 'critical': return 'bg-purple-500/10 text-purple-600 font-bold';
      default: return 'bg-surface-hover text-text-secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Journaux Système</h1>
          <p className="text-text-secondary mt-1">Surveillez les événements critiques et la sécurité de la plateforme.</p>
        </div>
        
        <Button onClick={handleDownloadReport} className="flex items-center gap-2 w-full sm:w-auto whitespace-nowrap">
          <Download className="h-4 w-4" />
          Télécharger le rapport
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input
              label="Recherche"
              placeholder="Chercher dans les logs, sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              iconLeft={<Search className="h-5 w-5" />}
            />
          </div>
          <div className="w-full md:w-48">
             <label className="block text-sm font-medium text-text-primary mb-1">
               Niveau d'erreur
             </label>
             <select 
               className="w-full h-10 px-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:ring-2 focus:ring-black"
               value={filterType}
               onChange={(e) => setFilterType(e.target.value)}
             >
               <option value="all">Tous les niveaux</option>
               <option value="info">Info</option>
               <option value="warning">Warning</option>
               <option value="error">Error</option>
               <option value="critical">Critical</option>
             </select>
          </div>
          <div className="w-full md:w-48">
            <Input
              label="Date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover border-b border-border-light">
                <th className="p-4 font-medium text-text-secondary text-sm w-16">Niveau</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Événement</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Source</th>
                <th className="p-4 font-medium text-text-secondary text-sm">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-secondary">
                    Aucun journal trouvé.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-hover transition-colors">
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        {getLogIcon(log.type)}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-text-primary">{log.message}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs ${getLogBadgeClass(log.type)}`}>
                        {log.source}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-text-secondary whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: fr })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
