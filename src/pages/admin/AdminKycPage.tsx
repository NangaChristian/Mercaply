import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useUserRole } from '../../hooks/useUserRole';
import { 
  ShieldCheck, AlertTriangle, CheckCircle, XCircle, Clock, 
  Search, Filter, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  RotateCw, MessageSquare, History, FileText, Building, User, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type KycStatus = 'pending' | 'under_review' | 'additional_docs_required' | 'approved' | 'rejected';

export function AdminKycPage() {
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  // Mock data for demonstration (to be replaced with Supabase fetch)
  const [kycQueue] = useState([
    {
      id: 'kyc-1',
      company_name: 'Tech Solutions Cameroun',
      type: 'B2B',
      submitted_at: '2026-07-24T08:30:00Z',
      status: 'pending',
      risk_score: 'low',
      documents: [
        { type: 'rccm', url: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=800&auto=format&fit=crop', name: 'RCCM_2026.pdf', status: 'pending' },
        { type: 'niu', url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop', name: 'NIU_Attestation.jpg', status: 'pending' },
        { type: 'id', url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop', name: 'CNI_Gerant.jpg', status: 'pending' }
      ],
      applicant: {
        name: 'Jean Dupont',
        email: 'jean@techsolutions.cm',
        phone: '+237 600 000 000'
      }
    },
    {
      id: 'kyc-2',
      company_name: 'Agro Distribution SARL',
      type: 'B2B',
      submitted_at: '2026-07-23T14:15:00Z',
      status: 'additional_docs_required',
      risk_score: 'medium',
      documents: [
        { type: 'rccm', url: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=800&auto=format&fit=crop', name: 'RCCM_Update.pdf', status: 'pending' }
      ],
      applicant: {
        name: 'Marie Claire',
        email: 'contact@agrodist.cm',
        phone: '+237 611 111 111'
      }
    }
  ]);

  const [activeDocument, setActiveDocument] = useState<any | null>(null);
  
  useEffect(() => {
    if (selectedRequest && selectedRequest.documents.length > 0) {
      setActiveDocument(selectedRequest.documents[0]);
      setZoomLevel(1);
      setRotation(0);
    }
  }, [selectedRequest]);

  if (!isAdmin) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none bg-white border-b border-slate-200 p-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" />
              Validation KYC Enterprise
            </h1>
            <p className="text-slate-500 text-sm mt-1">Examen des documents légaux et vérification des identités</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'queue' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              File d'attente (2)
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Historique
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar: Queue List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 bg-slate-50 flex flex-col ${selectedRequest ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Rechercher une entreprise..." 
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Filtres:</span>
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold cursor-pointer">Priorité Haute</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold cursor-pointer">Nouveaux</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {kycQueue.map((req) => (
              <div 
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={`p-4 border-b border-slate-200 cursor-pointer transition-colors ${
                  selectedRequest?.id === req.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-100 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-slate-900 truncate pr-2">{req.company_name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${
                    req.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {req.status === 'pending' ? 'Nouveau' : 'Complément'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{new Date(req.submitted_at).toLocaleString()}</p>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-xs font-medium ${
                    req.risk_score === 'low' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    <ShieldCheck className="w-3 h-3" /> 
                    Risque {req.risk_score === 'low' ? 'Faible' : 'Moyen'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">{req.documents.length} document(s)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Area: KYC Review Panel (Split Screen) */}
        {selectedRequest ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100">
            {/* Document Viewer */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 bg-[#E2E8F0]">
              <div className="h-14 bg-slate-900 flex items-center justify-between px-4 text-white">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedRequest(null)} className="md:hidden">
                    <ChevronLeft className="w-5 h-5 text-slate-400 hover:text-white" />
                  </button>
                  <span className="font-medium text-sm truncate">{activeDocument?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.2))} className="p-1.5 hover:bg-slate-800 rounded">
                    <ZoomOut className="w-4 h-4 text-slate-300" />
                  </button>
                  <span className="text-xs font-mono text-slate-400 w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                  <button onClick={() => setZoomLevel(z => Math.min(3, z + 0.2))} className="p-1.5 hover:bg-slate-800 rounded">
                    <ZoomIn className="w-4 h-4 text-slate-300" />
                  </button>
                  <div className="w-px h-4 bg-slate-700 mx-1"></div>
                  <button onClick={() => setRotation(r => r + 90)} className="p-1.5 hover:bg-slate-800 rounded">
                    <RotateCw className="w-4 h-4 text-slate-300" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative">
                {activeDocument ? (
                  <motion.div 
                    animate={{ scale: zoomLevel, rotate: rotation }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="shadow-2xl bg-white max-w-full max-h-full"
                  >
                    {/* Placeholder for real PDF/Image viewer */}
                    <img 
                      src={activeDocument.url} 
                      alt={activeDocument.name}
                      className="max-w-full max-h-[800px] object-contain"
                      draggable={false}
                    />
                  </motion.div>
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <FileText className="w-12 h-12 mb-2 opacity-50" />
                    <p>Sélectionnez un document</p>
                  </div>
                )}
              </div>
              
              {/* Document Selector */}
              <div className="h-24 bg-white border-t border-slate-200 p-2 flex gap-2 overflow-x-auto">
                {selectedRequest.documents.map((doc: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setActiveDocument(doc)}
                    className={`flex-shrink-0 w-32 rounded-lg border-2 overflow-hidden relative group ${
                      activeDocument?.name === doc.name ? 'border-blue-500' : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-semibold">Afficher</span>
                    </div>
                    <img src={doc.url} alt={doc.type} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1">
                      <p className="text-[10px] text-white truncate text-center font-medium">{doc.type.toUpperCase()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Validation Panel */}
            <div className="w-full lg:w-[400px] bg-white flex flex-col h-full border-l border-slate-200 overflow-y-auto">
              <div className="p-5 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-1">{selectedRequest.company_name}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Building className="w-4 h-4" /> Vendeur B2B
                </div>
              </div>
              
              <div className="p-5 flex-1">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Informations Déclarées</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Représentant Légal</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <User className="w-4 h-4 text-slate-400" /> {selectedRequest.applicant.name}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Contact</p>
                    <p className="text-sm font-medium text-slate-900">{selectedRequest.applicant.email}</p>
                    <p className="text-sm font-medium text-slate-900">{selectedRequest.applicant.phone}</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Audit & Décision</h3>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6">
                    <label className="block text-xs font-medium text-slate-700 mb-2">Commentaire Interne / Notes d'Audit</label>
                    <textarea 
                      className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                      rows={3}
                      placeholder="Notes visibles uniquement par l'administration..."
                    ></textarea>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors">
                      <CheckCircle className="w-5 h-5" />
                      Approuver le KYC
                    </button>
                    
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-medium transition-colors border border-amber-200">
                      <MessageSquare className="w-5 h-5" />
                      Demander des compléments
                    </button>
                    
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-red-50 text-red-600 rounded-lg font-medium transition-colors border border-red-200">
                      <XCircle className="w-5 h-5" />
                      Rejeter définitivement
                    </button>
                  </div>
                </div>
                
                <div className="mt-8 border-t border-slate-200 pt-6">
                   <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                     <History className="w-4 h-4 text-slate-400" /> Historique
                   </h3>
                   <div className="relative pl-4 border-l-2 border-slate-200 space-y-4">
                     <div className="relative">
                       <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></div>
                       <p className="text-xs font-semibold text-slate-900">Soumission Initiale</p>
                       <p className="text-xs text-slate-500">24 Juil 2026, 08:30</p>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white text-slate-500 p-8 text-center hidden md:flex">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Centre de Validation KYC</h3>
            <p className="max-w-md">Sélectionnez une demande dans la file d'attente pour examiner les documents légaux avec les outils d'audit avancés.</p>
          </div>
        )}
      </div>
    </div>
  );
}
