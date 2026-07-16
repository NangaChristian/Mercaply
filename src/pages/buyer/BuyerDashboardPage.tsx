// @ts-nocheck
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, CheckCircle2, CreditCard, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProductCard } from '../../components/product/ProductCard';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../store/useAuth';

export function BuyerDashboardPage() {
  const { user } = useAuth();
  const { products } = useProducts({ limitCount: 4 });
  const { orders } = useOrders(user?.uid || '', 'buyer');

  const totalSpent = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  const stats = [
    { title: 'Commandes totales', value: orders.length.toString(), icon: ShoppingBag, color: 'text-accent', bg: 'bg-accent/10' },
    { title: 'En cours', value: pendingOrders.toString(), icon: Package, color: 'text-warning', bg: 'bg-warning/10' },
    { title: 'Livrées', value: deliveredOrders.toString(), icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { title: 'Total dépensé', value: `${totalSpent.toLocaleString('fr-FR')} FCFA`, icon: CreditCard, color: 'text-primary', bg: 'bg-surface' },
  ];

  // Mock static chart data derived from actual orders sum for simplicity right now
  const chartData = [
    { name: 'Jan', amount: 0 },
    { name: 'Fév', amount: 0 },
    { name: 'Mar', amount: 0 },
    { name: 'Avr', amount: 0 },
    { name: 'Mai', amount: totalSpent },
    { name: 'Juin', amount: 0 },
  ];

  const recentOrders = orders.slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Tableau de bord</h1>
        <p className="text-text-secondary mt-1">Bienvenue dans votre espace personnel MERCAPLY.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-background rounded-2xl p-6 border border-border-light flex items-center shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">{stat.title}</p>
              <p className="text-xl font-bold text-text-primary mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-background rounded-2xl p-6 border border-border-light shadow-sm">
          <h2 className="text-lg font-bold text-text-primary mb-6">Dépenses mensuelles (FCFA)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E8ED" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#86868B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#86868B', fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#F5F5F7' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.09)' }}
                  formatter={(value: number) => [`${value.toLocaleString('fr-FR')} FCFA`, 'Dépenses']}
                />
                <Bar dataKey="amount" fill="#0071E3" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-background rounded-2xl p-6 border border-border-light shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary">Dernières commandes</h2>
            <Link to="/buyer/orders" className="text-sm font-medium text-accent hover:underline">Voir tout</Link>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {recentOrders.map((order) => {
              const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
              const itemCount = order.items?.length || 0;
              return (
                <Link key={order.id} to={`/buyer/orders/${order.id}`} className="block group">
                  <div className="p-3 rounded-xl border border-border-light hover:border-accent transition-colors bg-surface">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors">CMD-{order.id.slice(-6).toUpperCase()}</span>
                      <span className="text-xs text-text-tertiary">{dateStr}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-text-secondary">
                        {itemCount} article{itemCount > 1 ? 's' : ''}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-text-primary">{order.total.toLocaleString('fr-FR')} FCFA</div>
                        <div className="text-xs font-medium text-accent mt-0.5">{order.status}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Recommandé pour vous</h2>
          <Link to="/products" className="flex items-center text-sm font-medium text-accent hover:underline">
            Voir plus <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
