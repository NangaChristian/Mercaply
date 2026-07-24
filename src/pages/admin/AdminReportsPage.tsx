import React, { useState } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import { 
  AlertTriangle, Search, Filter, ShieldAlert, CheckCircle, 
  XCircle, Clock, FileText, ExternalLink, Flag, MessageSquare, ChevronLeft
} from 'lucide-react';

export function AdminReportsPage() {
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved' | 'rejected'>('pending');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // Mock data for the Enterprise moderation queue
  const reports = [
    {
      id: 'REP-2026-001',
      type: 'product',
      target: 'Iphone 15 Pro Max - Copie',
      target_id: 'prod_123',
      reporter: 'Alexandre B.',
      reason: 'contrefacon',
      description: 'Ce produit est une contrefaçon évidente, les photos montrent un système Android.',
      status: 'pending',
      created_at: '2026-07-24T10:15:00Z',
      severity: 'high',
      store: 'Tech Mobile Center'
    },
    {
      id: 'REP-2026-002',
      type: 'user',
      target: 'Marc Utilisateur',
      target_id: 'usr_456',
      reporter: 'Sophie M.',
      reason: 'harcelement',
      description: 'Ce vendeur m\'envoie des messages inappropriés depuis que j\'ai annulé ma commande.',
      status: 'pending',
      created_at: '2026-07-23T18:30:00Z',
      severity: 'critical',
      store: null
    },
    {
      id: 'REP-2026-003',
      type: 'review',
      target: 'Avis sur "Développement Web"',
      target_id: 'rev_789',
      reporter: 'Agence Web Plus',
      reason: 'faux_avis',
      description: 'Cet avis provient d\'un concurrent. La personne n\'a jamais été cliente.',
      status: 'pending',
      created_at: '2026-07-22T09:00:00Z',
      severity: 'low',
      store: null
    }
  ];

  if (!isAdmin) return null;

  const severityColors = {
    low: 'bg-blue-100 text-blue-700 border-blue-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
  };

  const getSeverityBadge = (severity: string) => {
    return (
      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${severityColors[severity as keyof typeof severityColors]}`}>
        Priorité {severity}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none bg-white border-b border-slate-200 p-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-red-600" />
              Centre de Modération (Trust & Safety)
            </h1>
            <p className="text-slate-500 text-sm mt-1">Traitement des signalements, fraudes et litiges</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              À traiter (3)
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'resolved' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Résolus
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Reports List */}
        <div className={`w-full lg:w-1/3 border-r border-slate-200 bg-white flex flex-col ${selectedReport ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Chercher un ID, un utilisateur..." 
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              <span className="flex-shrink-0 px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-semibold cursor-pointer">Tous</span>
              <span className="flex-shrink-0 px-2 py-1 bg-white border border-slate-300 text-slate-600 rounded text-xs font-medium hover:bg-slate-50 cursor-pointer">Produits</span>
              <span className="flex-shrink-0 px-2 py-1 bg-white border border-slate-300 text-slate-600 rounded text-xs font-medium hover:bg-slate-50 cursor-pointer">Utilisateurs</span>
              <span className="flex-shrink-0 px-2 py-1 bg-white border border-slate-300 text-slate-600 rounded text-xs font-medium hover:bg-slate-50 cursor-pointer">Avis</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {reports.map((report) => (
              <div 
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-4 border-b border-slate-200 cursor-pointer transition-colors ${
                  selectedReport?.id === report.id ? 'bg-red-50/50 border-l-4 border-l-red-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Flag className={`w-4 h-4 ${report.severity === 'critical' ? 'text-red-500' : 'text-slate-400'}`} />
                    <span className="text-xs font-mono text-slate-500">{report.id}</span>
                  </div>
                  {getSeverityBadge(report.severity)}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">{report.target}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mb-2">{report.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Par: {report.reporter}</span>
                  <span>{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Detail Panel */}
        <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden">
          {selectedReport ? (
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="p-6 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedReport(null)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-slate-900">Détail du Signalement</h2>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold font-mono">{selectedReport.id}</span>
                  </div>
                  {getSeverityBadge(selectedReport.severity)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Cible ({selectedReport.type})</p>
                    <div className="flex items-center gap-2 text-slate-900 font-medium">
                      {selectedReport.target}
                      <a href="#" className="text-blue-600 hover:text-blue-800"><ExternalLink className="w-4 h-4" /></a>
                    </div>
                    {selectedReport.store && (
                      <p className="text-sm text-slate-600 mt-1">Boutique : {selectedReport.store}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Plaignant</p>
                    <p className="text-slate-900 font-medium">{selectedReport.reporter}</p>
                    <p className="text-sm text-slate-600 mt-1">{new Date(selectedReport.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 max-w-4xl">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Description du problème</h3>
                  <div className="bg-red-50 text-red-900 p-4 rounded-lg border border-red-100 font-medium mb-4">
                    Motif : {selectedReport.reason.replace('_', ' ').toUpperCase()}
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedReport.description}</p>
                  
                  {/* Placeholder for AI Analysis */}
                  <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex gap-3">
                    <div className="mt-1">
                      <ShieldAlert className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-indigo-900 mb-1">Analyse IA (Beta)</p>
                      <p className="text-sm text-indigo-800">Forte probabilité de contrefaçon détectée dans les images (94% de confiance). Correspondance trouvée avec des images signalées précédemment.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Actions de Modération</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Note d'intervention (obligatoire)</label>
                    <textarea 
                      className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none" 
                      rows={3}
                      placeholder="Expliquez la décision prise..."
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button className="flex items-center justify-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                      <XCircle className="w-5 h-5" />
                      Supprimer l'élément
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors">
                      <AlertTriangle className="w-5 h-5" />
                      Avertir l'utilisateur
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      Classer sans suite
                    </button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <button className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1">
                      Suspendre le compte du vendeur (Action sévère)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-500 p-8 text-center">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Trust & Safety</h3>
              <p className="max-w-md">Sélectionnez un signalement pour l'examiner. Les signalements critiques doivent être traités en priorité absolue.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
