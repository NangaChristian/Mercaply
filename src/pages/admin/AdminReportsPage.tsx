import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../store/useToast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, Download, RefreshCw, DownloadCloud, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';



const initialSalesData = [
  { name: 'Lun', sales: 4000 },
  { name: 'Mar', sales: 3000 },
  { name: 'Mer', sales: 5000 },
  { name: 'Jeu', sales: 2780 },
  { name: 'Ven', sales: 8900 },
  { name: 'Sam', sales: 2390 },
  { name: 'Dim', sales: 3490 },
];

const initialUserGrowthData = [
  { name: 'Sem 1', users: 100 },
  { name: 'Sem 2', users: 200 },
  { name: 'Sem 3', users: 250 },
  { name: 'Sem 4', users: 400 },
  { name: 'Sem 5', users: 600 },
];

const initialCategoryData = [
  { name: 'Électronique', value: 400 },
  { name: 'Mode', value: 300 },
  { name: 'Maison', value: 300 },
  { name: 'Beauté', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AdminReportsPage() {
  const { addToast } = useToast();
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [salesData, setSalesData] = useState(initialSalesData);
  const [userGrowthData, setUserGrowthData] = useState(initialUserGrowthData);
  const [categoryData, setCategoryData] = useState(initialCategoryData);

  useEffect(() => {
    let interval: any;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        setSalesData(prev => prev.map(item => ({ ...item, sales: Math.max(0, item.sales + Math.floor(Math.random() * 500) - 250) })));
        setUserGrowthData(prev => prev.map(item => ({ ...item, users: Math.max(0, item.users + Math.floor(Math.random() * 20) - 5) })));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoRefresh]);


  const exportOrdersCSV = async () => {
    try {
      const { data: orders, error } = await supabase.from('orders').select('*').limit(1000);
      if (error) throw error;
      if (!orders || orders.length === 0) return addToast('info', 'Aucune commande à exporter');
      
      const headers = ['ID', 'Date', 'Status', 'Total', 'Customer ID'];
      const rows = orders.map(o => [o.id, o.createdAt, o.status, o.total_amount || o.total, o.customerId || o.customer_id].join(','));
      
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "orders_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('success', 'Rapport des commandes exporté avec succès');
    } catch (err) {
      console.error(err);
      addToast('error', 'Erreur lors de l\'exportation des commandes');
    }
  };

  const exportUsersCSV = async () => {
    try {
      const { data: users, error } = await supabase.from('profiles').select('*').limit(1000);
      if (error) throw error;
      if (!users || users.length === 0) return addToast('info', 'Aucun utilisateur à exporter');
      
      const headers = ['ID', 'Email', 'Role', 'Status', 'Created At'];
      const rows = users.map(u => [u.id, u.email, u.role, u.status, u.created_at].join(','));
      
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "users_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('success', 'Rapport des utilisateurs exporté avec succès');
    } catch (err) {
      console.error(err);
      addToast('error', 'Erreur lors de l\'exportation des utilisateurs');
    }
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + "Total Sales," + salesData.reduce((acc, curr) => acc + curr.sales, 0) + "\n"
      + "Total Users," + userGrowthData[userGrowthData.length - 1].users + "\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "platform_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Rapport exporté avec succès');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Rapports et Analytiques</h1>
          <p className="text-text-secondary mt-1">Consultez les métriques clés de la plateforme.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            variant={isAutoRefresh ? 'primary' : 'secondary'} 
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <RefreshCw className={`h-4 w-4 ${isAutoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          
          <Button variant="secondary" onClick={exportOrdersCSV} className="flex items-center gap-2 whitespace-nowrap">
            <DownloadCloud className="h-4 w-4" />
            Commandes (CSV)
          </Button>
          <Button variant="secondary" onClick={exportUsersCSV} className="flex items-center gap-2 whitespace-nowrap">
            <Users className="h-4 w-4" />
            Utilisateurs (CSV)
          </Button>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Ventes Quotidiennes</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="#000000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Croissance Utilisateurs</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Catégories les plus vendues</h2>
          </div>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
