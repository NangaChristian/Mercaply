import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useUserRole } from '../../hooks/useUserRole';
import { 
  Users, Store, Package, Briefcase, ShoppingBag, DollarSign, 
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, 
  Activity, ShieldCheck, AlertTriangle, FileText, Download, Wallet 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line
} from 'recharts';

export function AdminDashboardPage() {
  const { isAdmin } = useUserRole();
  const [loading, setLoading] = useState(true);
  
  // Real stats state
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    products: 0,
    services: 0,
    orders: 0,
    gmv: 0,
    commission: 0,
    pendingKyc: 0,
    reports: 0
  });

  // Fetch real basic stats
  useEffect(() => {
    async function loadStats() {
      if (!supabase) return;
      try {
        const [
          { count: usersCount },
          { count: companiesCount },
          { count: productsCount },
          { count: servicesCount },
          { count: ordersCount },
          { count: kycCount },
          { count: reportsCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('companies').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('services').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('kyc_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ]);

        const { data: ordersData } = await supabase
          .from('orders')
          .select('total_amount, status')
          .in('status', ['delivered', 'completed', 'shipped', 'confirmed']);
          
        let gmv = 0;
        if (ordersData) {
          gmv = ordersData.reduce((acc, curr) => acc + Number(curr.total_amount), 0);
        }

        setStats({
          users: usersCount || 0,
          companies: companiesCount || 0,
          products: productsCount || 0,
          services: servicesCount || 0,
          orders: ordersCount || 0,
          gmv: gmv,
          commission: gmv * 0.05, // Approximation for now
          pendingKyc: kycCount || 0,
          reports: reportsCount || 0
        });
      } catch (err) {
        console.error("Error loading enterprise stats:", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  // Mock data for charts (to be replaced by materialized views in production)
  const gmvData = [
    { name: 'Jan', gmv: 4000, commission: 200 },
    { name: 'Fév', gmv: 3000, commission: 150 },
    { name: 'Mar', gmv: 5000, commission: 250 },
    { name: 'Avr', gmv: 8780, commission: 439 },
    { name: 'Mai', gmv: 12000, commission: 600 },
    { name: 'Juin', gmv: 15000, commission: 750 },
    { name: 'Juil', gmv: 14500, commission: 725 },
  ];

  const conversionData = [
    { name: 'Lun', conv: 2.4 },
    { name: 'Mar', conv: 2.8 },
    { name: 'Mer', conv: 3.2 },
    { name: 'Jeu', conv: 3.8 },
    { name: 'Ven', conv: 4.1 },
    { name: 'Sam', conv: 4.5 },
    { name: 'Dim', conv: 4.2 },
  ];

  if (!isAdmin) return null;

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 mt-1">Plateforme Enterprise V2 • Performance globale & KPIs</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-colors font-medium text-sm">
            <FileText className="w-4 h-4" />
            Générer Rapport
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg shadow-sm hover:bg-accent-hover transition-colors font-medium text-sm">
            <Download className="w-4 h-4" />
            Export Financier CSV
          </button>
        </div>
      </div>

      {/* Actionable Alerts (KYC, Reports) */}
      {(stats.pendingKyc > 0 || stats.reports > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.pendingKyc > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900">Validations KYC en attente</h4>
                  <p className="text-sm text-amber-700">{stats.pendingKyc} entreprises attendent votre validation.</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700">Examiner</button>
            </div>
          )}
          {stats.reports > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-900">Signalements à traiter</h4>
                  <p className="text-sm text-red-700">{stats.reports} signalements requièrent une modération.</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">Modérer</button>
            </div>
          )}
        </div>
      )}

      {/* Top Level KPIs (Tier 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <DollarSign className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">GMV (Volume Brut)</p>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold">
                <ArrowUpRight className="w-3 h-3" /> +24.5%
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{loading ? '-' : stats.gmv.toLocaleString()} CFA</h3>
            <p className="text-sm text-slate-500 mt-2">Vs. période précédente</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Activity className="w-24 h-24 text-accent" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Commissions Net</p>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold">
                <ArrowUpRight className="w-3 h-3" /> +18.2%
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{loading ? '-' : stats.commission.toLocaleString()} CFA</h3>
            <p className="text-sm text-slate-500 mt-2">Moyenne 5% appliquée</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <ShoppingBag className="w-24 h-24 text-indigo-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Commandes B2B/B2C</p>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold">
                <ArrowUpRight className="w-3 h-3" /> +12.4%
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{loading ? '-' : stats.orders.toLocaleString()}</h3>
            <p className="text-sm text-slate-500 mt-2">Transactions terminées</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Users className="w-24 h-24 text-purple-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Utilisateurs</p>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold">
                <ArrowUpRight className="w-3 h-3" /> +8.1%
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{loading ? '-' : stats.users.toLocaleString()}</h3>
            <p className="text-sm text-slate-500 mt-2">Comptes acheteurs actifs</p>
          </div>
        </div>
      </div>

      {/* Secondary KPIs (Tier 2) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Entreprises Vérifiées', value: stats.companies, icon: Store, color: 'text-indigo-600' },
          { label: 'Produits Actifs', value: stats.products, icon: Package, color: 'text-orange-600' },
          { label: 'Services B2B', value: stats.services, icon: Briefcase, color: 'text-teal-600' },
          { label: 'Taux de Conversion', value: '4.2%', icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Temps Rép. Moyen', value: '1.4h', icon: Activity, color: 'text-accent' },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className={`p-3 rounded-lg bg-slate-50 ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{item.label}</p>
              <p className="text-lg font-bold text-slate-900">{loading ? '-' : item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main GMV Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Croissance GMV & Commissions</h3>
              <p className="text-sm text-slate-500">Volume brut vs Revenu net généré (Millions CFA)</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none">
              <option>7 Derniers Mois</option>
              <option>Cette Année</option>
              <option>Année Précédente</option>
            </select>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gmvData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="gmv" name="Volume Brut" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorGmv)" />
                <Area type="monotone" dataKey="commission" name="Commissions" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorCommission)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Taux de Conversion</h3>
              <p className="text-sm text-slate-500">Tendances de la semaine</p>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversionData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="conv" name="Conversion (%)" stroke="#8B5CF6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Real-time Activity / Live Feed (Static Mock for visual impact) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Transactions Récentes</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Commande #ORD-{1000 + i*43}</p>
                    <p className="text-xs text-slate-500">Il y a {i*2 + 1} minutes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{(15000 * (i+1)).toLocaleString()} CFA</p>
                  <p className="text-xs text-emerald-600 font-medium">Payé (Stripe)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Demandes de Retrait (Payouts)</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Entreprise Vendeur {['A', 'B', 'C'][i]}</p>
                    <p className="text-xs text-slate-500">Orange Money</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-slate-900">{(500000 * (i+1)).toLocaleString()} CFA</p>
                  <button className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md hover:bg-slate-800">Valider</button>
                </div>
              </div>
            ))}
            <button className="w-full py-3 mt-2 text-sm font-medium text-accent hover:text-blue-700 bg-blue-50 rounded-lg">
              Voir toutes les demandes (12)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
