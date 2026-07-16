import { useAuth } from '../../store/useAuth';
import { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Users, ShoppingBag, Eye, DollarSign, Package } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { cn } from '../../utils/cn';

const COLORS = ['#0066FF', '#00C49F', '#FFBB28', '#FF8042', '#A28CF2', '#F28C8C'];

export function SellerStatsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('30j');
  const { orders: sellerOrders } = useOrders(user?.uid || '', 'seller');
  
  const validOrders = useMemo(() => sellerOrders.filter(o => o.status !== 'cancelled'), [sellerOrders]);

  const revenues = validOrders.reduce((sum, o) => sum + o.total, 0);

  // Dynamic Sales Data based on period
  const salesData = useMemo(() => {
    let numDays = 7;
    if (period === '30j') numDays = 30;
    if (period === '3m') numDays = 90;
    if (period === '1a') numDays = 365;

    const data = [];
    const today = new Date();
    
    // Generate dates
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isMonth = period === '1a' || period === '3m';
      
      const label = isMonth 
        ? d.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
        : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

      // We might have duplicates for months if we just do day by day, 
      // but for '1a' we probably want monthly aggregation.
      data.push({
        dateStr: d.toDateString(),
        name: label,
        date: d,
        sales: 0,
        ordersCount: 0,
        visitors: Math.floor(Math.random() * 50) + 10 // Mock visitors
      });
    }

    // Map orders to days
    validOrders.forEach(o => {
      if (o.createdAt) {
        const d = new Date(o.createdAt);
        if (!isNaN(d.getTime())) {
          const entry = data.find(item => item.dateStr === d.toDateString());
          if (entry) {
            entry.sales += Number(o.total || 0);
            entry.ordersCount += 1;
          }
        }
      }
    });

    // If 1 year or 3 months, maybe aggregate by week or month to avoid 365 data points.
    // For simplicity and interactivity, Recharts can handle 90 points. For 365, let's aggregate by month.
    if (period === '1a') {
      const monthlyData = [];
      data.forEach(item => {
        const monthYear = item.date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        let mEntry = monthlyData.find(m => m.name === monthYear);
        if (!mEntry) {
          mEntry = { name: monthYear, sales: 0, ordersCount: 0, visitors: 0 };
          monthlyData.push(mEntry);
        }
        mEntry.sales += item.sales;
        mEntry.ordersCount += item.ordersCount;
        mEntry.visitors += item.visitors;
      });
      return monthlyData;
    }

    return data;
  }, [validOrders, period]);

  // Top Performing Products
  const topProducts = useMemo(() => {
    const productsMap = new Map();
    validOrders.forEach(o => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach(item => {
          const id = item.productId || item.id || item.name;
          const name = item.product?.title || item.name || 'Produit inconnu';
          const qty = item.quantity || item.qty || 1;
          const revenue = qty * (item.product?.price || item.price || 0);
          
          if (!productsMap.has(id)) {
            productsMap.set(id, { name, qty: 0, revenue: 0 });
          }
          const p = productsMap.get(id);
          p.qty += qty;
          p.revenue += revenue;
        });
      }
    });
    
    return Array.from(productsMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [validOrders]);

  // Monthly Revenue for a specific chart
  const monthlyRevenueData = useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentYear = new Date().getFullYear();
    const data = months.map(m => ({ name: m, revenue: 0 }));
    
    validOrders.forEach(o => {
      if (o.createdAt) {
        const d = new Date(o.createdAt);
        if (!isNaN(d.getTime()) && d.getFullYear() === currentYear) {
          data[d.getMonth()].revenue += Number(o.total || 0);
        }
      }
    });
    return data;
  }, [validOrders]);

  const totalVisitors = salesData.reduce((sum, item) => sum + item.visitors, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tableau de bord analytique</h1>
          <p className="text-sm text-text-secondary mt-1">Suivez vos performances et l'évolution de vos ventes.</p>
        </div>
        <div className="flex items-center bg-background border border-border-light rounded-xl p-1 shadow-sm">
          {[{id: '7j', label: '7 Jours'}, {id: '30j', label: '30 Jours'}, {id: '3m', label: '3 Mois'}, {id: '1a', label: '1 An'}].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                period === p.id ? 'bg-text-primary text-white' : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background p-6 rounded-2xl border border-border-light shadow-sm hover:border-accent transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-text-secondary">
              <TrendingUp className="h-5 w-5 mr-2 text-accent" />
              <span className="text-sm font-medium">Chiffre d'affaires</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-text-primary">{revenues.toLocaleString('fr-FR')} FCFA</h3>
          <p className="text-sm text-success mt-2 font-medium flex items-center">
             <TrendingUp className="h-3 w-3 mr-1" /> +12.5% vs période préc.
          </p>
        </div>
        
        <div className="bg-background p-6 rounded-2xl border border-border-light shadow-sm hover:border-accent transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-text-secondary">
              <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
              <span className="text-sm font-medium">Commandes</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-text-primary">{validOrders.length}</h3>
          <p className="text-sm text-success mt-2 font-medium flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" /> +5.2% vs période préc.
          </p>
        </div>

        <div className="bg-background p-6 rounded-2xl border border-border-light shadow-sm hover:border-accent transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-text-secondary">
              <Users className="h-5 w-5 mr-2 text-warning-dark" />
              <span className="text-sm font-medium">Visiteurs (est.)</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-text-primary">{totalVisitors.toLocaleString('fr-FR')}</h3>
          <p className="text-sm text-success mt-2 font-medium flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" /> +8.1% vs période préc.
          </p>
        </div>

        <div className="bg-background p-6 rounded-2xl border border-border-light shadow-sm hover:border-accent transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-text-secondary">
              <Eye className="h-5 w-5 mr-2 text-success" />
              <span className="text-sm font-medium">Taux de conversion</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-text-primary">
            {totalVisitors > 0 ? ((validOrders.length / totalVisitors) * 100).toFixed(1) : 0}%
          </h3>
          <p className="text-sm text-text-tertiary mt-2 font-medium flex items-center">
            Stable vs période préc.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Sales Trend Chart */}
        <div className="lg:col-span-2 bg-background p-6 rounded-2xl border border-border-light shadow-sm">
          <h3 className="text-lg font-bold text-text-primary mb-6">Tendance des ventes</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E8ED" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#86868B' }} 
                  dy={10} 
                  minTickGap={20}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#86868B' }} 
                  tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E8E8ED', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  formatter={(value: number, name: string) => [
                    name === 'sales' ? `${value.toLocaleString('fr-FR')} FCFA` : value,
                    name === 'sales' ? 'Chiffre d\'affaires' : name
                  ]}
                  labelStyle={{ fontWeight: 'bold', color: '#1D1D1F', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  name="sales"
                  stroke="#0066FF" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-background p-6 rounded-2xl border border-border-light shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-text-primary mb-6">Meilleurs produits</h3>
          {topProducts.length > 0 ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {topProducts.map((prod, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 mr-4">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs mr-3 flex-shrink-0">
                        #{idx + 1}
                      </div>
                      <p className="text-sm font-medium text-text-primary truncate">{prod.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-text-primary">{prod.revenue.toLocaleString('fr-FR')} F</p>
                      <p className="text-xs text-text-secondary">{prod.qty} vendus</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="h-40 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topProducts}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="revenue"
                    >
                      {topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `${value.toLocaleString('fr-FR')} FCFA`}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Package className="h-12 w-12 text-text-tertiary mb-3" />
              <p className="text-sm text-text-secondary">Aucune vente sur cette période.</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Revenue Bar Chart */}
      <div className="bg-background p-6 rounded-2xl border border-border-light shadow-sm">
        <h3 className="text-lg font-bold text-text-primary mb-6">Revenus mensuels ({new Date().getFullYear()})</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E8ED" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#86868B' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#86868B' }} 
                tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} 
              />
              <Tooltip 
                cursor={{ fill: '#F5F5F7' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                formatter={(value: number) => [`${value.toLocaleString('fr-FR')} FCFA`, 'Revenu']}
              />
              <Bar 
                dataKey="revenue" 
                fill="#00C49F" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
