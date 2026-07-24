import React, { useState } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import { 
  Building2, Search, Filter, ShieldCheck, AlertTriangle, 
  ChevronRight, MoreVertical, ExternalLink, Package, Briefcase, 
  DollarSign, Wallet, Users, LayoutDashboard, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AdminStoresPage() {
  const { isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'suspended'>('all');
  const [selectedStore, setSelectedStore] = useState<any | null>(null);

  // Mock data representing robust B2B companies
  const stores = [
    {
      id: 'COMP-001',
      name: 'Tech Distribution Cameroun',
      type: 'B2B & B2C',
      status: 'verified',
      created_at: '2025-11-12T00:00:00Z',
      stats: {
        products: 1450,
        services: 12,
        orders: 3450,
        gmv: 45000000,
        wallet: 2500000
      },
      verification: {
        rccm: 'RC/DLA/2022/B/1234',
        niu: 'M122312345678Z',
        level: 'gold'
      },
      contact: {
        email: 'direction@techdist.cm',
        phone: '+237 600 000 000',
        city: 'Douala',
        country: 'Cameroun'
      }
    },
    {
      id: 'COMP-002',
      name: 'Agro Alimentaire SA',
      type: 'B2B',
      status: 'verified',
      created_at: '2026-02-05T00:00:00Z',
      stats: {
        products: 45,
        services: 0,
        orders: 120,
        gmv: 12000000,
        wallet: 450000
      },
      verification: {
        rccm: 'RC/YDE/2021/B/5678',
        niu: 'M987654321098X',
        level: 'silver'
      },
      contact: {
        email: 'contact@agroalim.cm',
        phone: '+237 611 111 111',
        city: 'Yaoundé',
        country: 'Cameroun'
      }
    },
    {
      id: 'COMP-003',
      name: 'Consulting IT Express',
      type: 'Service Only',
      status: 'suspended',
      created_at: '2026-05-20T00:00:00Z',
      stats: {
        products: 0,
        services: 5,
        orders: 12,
        gmv: 1500000,
        wallet: 0
      },
      verification: {
        rccm: 'Pending',
        niu: 'Pending',
        level: 'none'
      },
      contact: {
        email: 'hello@consultit.com',
        phone: '+237 622 222 222',
        city: 'Douala',
        country: 'Cameroun'
      }
    }
  ];

  if (!isAdmin) return null;

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            Entreprises & Vendeurs
          </h1>
          <p className="text-slate-500 mt-1">Gérez le catalogue des entreprises, leurs wallets et leurs accès.</p>
        </div>
        
        <div className="flex bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'verified' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Vérifiées
          </button>
          <button
            onClick={() => setActiveTab('suspended')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'suspended' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Suspendues
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Rechercher par nom d'entreprise, RCCM, NIU ou Email..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" /> Filtres Avancés
          </button>
        </div>

        {/* Data Grid */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/50 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Entreprise</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Légal & KYC</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Catalogue</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Finances</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">
                        {store.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{store.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{store.id} • {store.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs font-semibold ${
                        store.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {store.status === 'verified' ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {store.status === 'verified' ? 'KYC Validé' : 'Suspendu'}
                      </span>
                      <span className="text-xs font-mono text-slate-500">RCCM: {store.verification.rccm}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-slate-500 flex items-center gap-1"><Package className="w-3 h-3" /> Prod</p>
                        <p className="font-semibold text-slate-900">{store.stats.products}</p>
                      </div>
                      <div className="w-px h-8 bg-slate-200"></div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Serv</p>
                        <p className="font-semibold text-slate-900">{store.stats.services}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-bold text-slate-900 flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        {store.stats.gmv.toLocaleString()} CFA
                      </p>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Wallet className="w-3 h-3 text-slate-400" /> Wallet: {store.stats.wallet.toLocaleString()} CFA
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-sm text-slate-500">
          <p>Affichage de 1 à 3 sur 3 entreprises</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50">Précédent</button>
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
