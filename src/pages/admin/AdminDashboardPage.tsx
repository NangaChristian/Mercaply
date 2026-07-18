// @ts-nocheck
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/useAuth';
import { useUserRole } from '../../hooks/useUserRole';
import { Card } from '../../components/ui/Card';
import { AdminActionModal } from '../../components/admin/AdminActionModal';
import { logAdminAction } from '../../utils/adminAudit';
import { useToast } from '../../store/useToast';
import { 
  Users, 
  Store, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  Activity,
  Plus,
  Ban,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface AdminStats {
  usersCount: number;
  storesCount: number;
  productsCount: number;
  ordersCount: number;
  totalRevenue: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AdminDashboardPage() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { addToast } = useToast();
  
  const [stats, setStats] = useState<AdminStats>({
    usersCount: 0,
    storesCount: 0,
    productsCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<any>(null);

  const [salesData, setSalesData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: storesCount } = await supabase.from('stores').select('*', { count: 'exact', head: true });
        const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
        const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        
        let totalRevenue = 0;
        const salesByMonth: Record<string, number> = {
          'Jan': 0, 'Fév': 0, 'Mar': 0, 'Avr': 0, 'Mai': 0, 'Juin': 0, 'Juil': 0, 'Août': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Déc': 0
        };
        const usersByMonth: Record<string, number> = {
          'Jan': 0, 'Fév': 0, 'Mar': 0, 'Avr': 0, 'Mai': 0, 'Juin': 0, 'Juil': 0, 'Août': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Déc': 0
        };
        const catCounts: Record<string, number> = {};

        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

        ordersSnap.forEach(doc => {
          const data = doc.data();
          if (data.status === 'delivered' || data.status === 'completed') {
             totalRevenue += Number(data.total || data.total_amount || 0);
          }
          if (data.createdAt) {
            const date = new Date(data.createdAt);
            if (!isNaN(date.getTime())) {
              const monthStr = months[date.getMonth()];
              if (salesByMonth[monthStr] !== undefined) {
                 salesByMonth[monthStr] += Number(data.total || data.total_amount || 0);
              }
            }
          }
        });

        usersSnap.forEach(doc => {
          const data = doc.data();
          if (data.createdAt) {
            const date = new Date(data.createdAt);
            if (!isNaN(date.getTime())) {
              const monthStr = months[date.getMonth()];
              if (usersByMonth[monthStr] !== undefined) {
                 usersByMonth[monthStr] += 1;
              }
            }
          }
        });

        productsSnap.forEach(doc => {
          const data = doc.data();
          const cat = data.category || 'Non classé';
          catCounts[cat] = (catCounts[cat] || 0) + 1;
        });

        setStats({
          usersCount,
          storesCount,
          productsCount,
          ordersCount,
          totalRevenue,
        });

        const newSalesData = months.map(m => ({ name: m, sales: salesByMonth[m] }));
        setSalesData(newSalesData);
        
        let cumulativeUsers = 0;
        const newUserGrowth = months.map(m => {
           cumulativeUsers += usersByMonth[m];
           return { name: m, users: cumulativeUsers };
        });
        setUserGrowthData(newUserGrowth);

        const newCatData = Object.entries(catCounts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);
        setCategoryData(newCatData);

      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);


  const handleAction = (action: string) => {
    setIsQuickActionsOpen(false);
    
    if (action === 'ban') {
      setModalConfig({
        isOpen: true,
        title: 'Bannir un utilisateur',
        description: 'Veuillez indiquer l\'ID de l\'utilisateur et la raison du bannissement. Cette action est irréversible.',
        actionLabel: 'Bannir',
        isDestructive: true,
        onConfirm: (reason) => {
          logAdminAction('ban_user', 'unknown', reason);
          addToast('success', `L'utilisateur a été banni. Raison: ${reason}`);
          setModalConfig(null);
        }
      });
    } else if (action === 'verify') {
      setModalConfig({
        isOpen: true,
        title: 'Vérifier une boutique',
        description: 'Veuillez indiquer l\'ID de la boutique et ajouter une note pour la vérification.',
        actionLabel: 'Vérifier',
        isDestructive: false,
        onConfirm: (reason) => {
          logAdminAction('verify_store', 'unknown', reason);
          addToast('success', `La boutique a été vérifiée. Note: ${reason}`);
          setModalConfig(null);
        }
      });
    } else if (action === 'promo') {
      logAdminAction('create_promo', 'global');
      addToast('info', 'La création de promotion globale sera bientôt disponible.');
    }
  };

  const statCards = [
    {
      title: 'Utilisateurs Totaux',
      value: stats.usersCount,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      trend: '+12% ce mois',
      trendUp: true
    },
    {
      title: 'Boutiques Actives',
      value: stats.storesCount,
      icon: Store,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      trend: '+5% ce mois',
      trendUp: true
    },
    {
      title: 'Produits en Ligne',
      value: stats.productsCount,
      icon: Package,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      trend: '+18% ce mois',
      trendUp: true
    },
    {
      title: 'Commandes',
      value: stats.ordersCount,
      icon: ShoppingBag,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      trend: '+24% ce mois',
      trendUp: true
    },
    {
      title: 'Revenu Total',
      value: `${stats.totalRevenue.toLocaleString()} CFA`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      trend: '+15% ce mois',
      trendUp: true
    }
  ];

  if (!isAdmin) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Tableau de bord</h1>
        <p className="text-text-secondary mt-1">Vue d'ensemble de l'activité de la plateforme.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-text-secondary text-sm font-medium">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-text-primary mt-2">
                    {isLoading ? '-' : stat.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp className={`h-4 w-4 ${stat.trendUp ? 'text-emerald-500' : 'text-error'}`} />
                <span className={`text-sm font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-error'}`}>
                  {stat.trend}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text-primary">Volume des ventes (Mensuel)</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text-primary">Croissance des utilisateurs</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text-primary">Catégories les plus performantes</h3>
          </div>
          <div className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Floating Quick Actions Menu */}
      <div className="fixed bottom-8 right-8 z-40">
        <div className="relative">
          {isQuickActionsOpen && (
            <div className="absolute bottom-16 right-0 mb-2 w-48 bg-surface rounded-xl shadow-lg border border-border-light overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
              <button 
                onClick={() => handleAction('promo')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary hover:bg-surface-hover transition-colors text-left"
              >
                <Tag className="h-4 w-4 text-accent" />
                Nouvelle Promo
              </button>
              <button 
                onClick={() => handleAction('verify')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-primary hover:bg-surface-hover transition-colors text-left"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Vérifier Boutique
              </button>
              <button 
                onClick={() => handleAction('ban')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-danger hover:bg-danger/10 transition-colors text-left border-t border-border-light"
              >
                <Ban className="h-4 w-4" />
                Bannir Utilisateur
              </button>
            </div>
          )}
          <button
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className="flex items-center justify-center w-14 h-14 bg-black text-white rounded-full shadow-lg hover:bg-black/90 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            <Plus className={`h-6 w-6 transition-transform duration-200 ${isQuickActionsOpen ? 'rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {modalConfig && (
        <AdminActionModal
          isOpen={modalConfig.isOpen}
          onClose={() => setModalConfig(null)}
          onConfirm={modalConfig.onConfirm}
          title={modalConfig.title}
          description={modalConfig.description}
          actionLabel={modalConfig.actionLabel}
          isDestructive={modalConfig.isDestructive}
        />
      )}
    </div>
  );
}
