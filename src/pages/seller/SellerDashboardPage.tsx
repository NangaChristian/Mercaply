// @ts-nocheck
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../store/useAuth";
import { ShieldAlert } from "lucide-react";
import { Link } from 'react-router-dom';
import { TrendingUp, Package, ShoppingCart, Star, AlertTriangle, MessageCircle, Clock, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';

const COLORS = ['#0066FF', '#00C49F', '#FFBB28', '#FF8042'];

export function SellerDashboardPage() {
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState('unverified');

  useEffect(() => {
    async function fetchVerificationStatus() {
      if (!user?.uid || !supabase) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('verification_status')
          .eq('id', user.uid)
          .single();
        if (!error && data) {
          setVerificationStatus(data.verification_status || 'unverified');
        }
      } catch (err) {
        console.error('Error fetching verification status', err);
      }
    }
    fetchVerificationStatus();
  }, [user]);

  const { orders } = useOrders(user?.uid || '', 'seller');
  const { products } = useProducts({ sellerId: user?.uid });

  const totalSales = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, order) => sum + (order.total || 0), 0);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const activeProducts = products.length; // Actually should filter by status if applicable
  const totalOrdersToShip = orders.filter(o => o.status === 'processing').length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  const recentOrders = orders.slice(0, 4);

  // Group sales by some mock format for now if we don't have enough data? No, let's group by dates
  // Or just provide a simple mock structure but with real count if possible
  // Since we don't have enough real date data sometimes, we'll try to group by createdAt
  const salesMap = new Map<string, number>();
  orders.filter(o => o.status === 'delivered').forEach(o => {
    const date = o.createdAt?.split('T')[0] || o.createdAt?.split(' ')[0] || 'Unknown';
    salesMap.set(date, (salesMap.get(date) || 0) + (o.total || 0));
  });

  const salesData = Array.from(salesMap.entries()).map(([name, sales]) => ({ name, sales }));
  if (salesData.length === 0) {
    salesData.push({ name: '01/01', sales: 0 }); // Fallback for UI visualization
  }

  const categoryMap = new Map<string, number>();
  products.forEach(p => {
    const cat = p.category;
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  });

  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  if (categoryData.length === 0) {
    categoryData.push({ name: 'Aucune', value: 1 });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Tableau de bord</h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-text-secondary">Bienvenue sur votre espace vendeur Mercaply.</p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
            Rôle actuel : {user?.role || 'Inconnu'}
          </div>
        </div>
      </div>
      
      {verificationStatus !== 'verified' && (
        <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-start">
            <ShieldAlert className="h-6 w-6 text-warning-dark mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-warning-dark">
                {verificationStatus === 'pending' ? 'Vérification en cours' : 
                 verificationStatus === 'rejected' ? 'Vérification échouée' : 
                 'Complétez votre profil vendeur'}
              </h4>
              <p className="text-sm text-warning-dark/80 mt-1">
                {verificationStatus === 'pending' ? 'Vos documents sont en cours de validation par notre équipe.' : 
                 verificationStatus === 'rejected' ? 'Vos documents ont été rejetés. Veuillez les soumettre à nouveau.' : 
                 'Vous devez vérifier votre identité et votre entreprise pour pouvoir retirer vos fonds et augmenter votre visibilité.'}
              </p>
            </div>
          </div>
          <Link 
            to="/seller/verification" 
            className="whitespace-nowrap px-4 py-2 bg-warning text-white rounded-lg text-sm font-bold hover:bg-warning-dark transition-colors"
          >
            {verificationStatus === 'pending' ? 'Voir le statut' : 'Vérifier maintenant'}
          </Link>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background p-6 rounded-2xl border border-border-light shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-text-secondary">Ventes (livrées)</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">{totalSales.toLocaleString('fr-FR')} FCFA</h3>
            </div>
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-background p-6 rounded-2xl border border-border-light shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-text-secondary">Commandes en cours</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">{pendingOrders}</h3>
            </div>
            <div className="p-2 bg-warning/10 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-warning-dark" />
            </div>
          </div>
          <p className="text-sm text-text-secondary mt-4">
            {totalOrdersToShip} à expédier aujourd'hui
          </p>
        </div>

        <div className="bg-background p-6 rounded-2xl border border-border-light shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-text-secondary">Produits actifs</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">{activeProducts}</h3>
            </div>
            <div className="p-2 bg-accent/10 rounded-lg">
              <Package className="h-5 w-5 text-accent" />
            </div>
          </div>
          <p className="text-sm text-text-secondary mt-4">
            {lowStockProducts} produits d'attention
          </p>
        </div>

        <div className="bg-background p-6 rounded-2xl border border-border-light shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-text-secondary">Commandes totales</p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">{orders.length}</h3>
            </div>
            <div className="p-2 bg-[#FFCC00]/10 rounded-lg">
              <Star className="h-5 w-5 text-[#FFCC00]" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lowStockProducts > 0 && (
          <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex items-start">
            <AlertTriangle className="h-5 w-5 text-warning-dark mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-warning-dark">Stock d'attention</h4>
              <p className="text-xs text-warning-dark/80 mt-1">{lowStockProducts} produits à vérifier.</p>
              <Link to="/seller/products" className="text-xs font-medium text-warning-dark hover:underline mt-2 inline-block">Gérer les stocks</Link>
            </div>
          </div>
        )}
        {totalOrdersToShip > 0 && (
          <div className="bg-accent/10 border border-accent/20 p-4 rounded-xl flex items-start">
            <Clock className="h-5 w-5 text-accent mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-accent">Commandes à traiter</h4>
              <p className="text-xs text-accent/80 mt-1">{totalOrdersToShip} commandes attendent d'être expédiées.</p>
              <Link to="/seller/orders" className="text-xs font-medium text-accent hover:underline mt-2 inline-block">Voir les commandes</Link>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-background p-6 rounded-2xl border border-border-light shadow-sm">
          <h3 className="text-lg font-bold text-text-primary mb-6">Évolution des ventes</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value.toLocaleString('fr-FR')} FCFA`, 'Ventes']}
                />
                <Line type="monotone" dataKey="sales" stroke="#0066FF" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Chart */}
        <div className="bg-background p-6 rounded-2xl border border-border-light shadow-sm">
          <h3 className="text-lg font-bold text-text-primary mb-6">Produits par catégorie</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} produits`, '']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-text-secondary">{category.name}</span>
                </div>
                <span className="font-medium text-text-primary">{category.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-background rounded-2xl border border-border-light shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border-light flex justify-between items-center">
          <h3 className="text-lg font-bold text-text-primary">Dernières commandes</h3>
          <Link to="/seller/orders" className="text-sm font-medium text-accent hover:underline flex items-center">
            Voir tout <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-text-secondary text-sm">
                <th className="p-4 font-medium">Commande</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Client</th>
                <th className="p-4 font-medium">Montant</th>
                <th className="p-4 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-text-secondary">Aucune commande récente.</td>
                </tr>
              ) : recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                  <td className="p-4 font-medium text-text-primary">{order.id}</td>
                  <td className="p-4 text-text-secondary text-sm">{order.createdAt || 'Inconnue'}</td>
                  <td className="p-4 text-text-primary text-sm">{order.customer?.name || 'Inconnu'}</td>
                  <td className="p-4 font-bold text-text-primary">{(order.total || 0).toLocaleString('fr-FR')} FCFA</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-warning/10 text-warning-dark' :
                      order.status === 'processing' ? 'bg-accent/10 text-accent' :
                      order.status === 'shipped' ? 'bg-primary/10 text-primary' :
                      'bg-success/10 text-success'
                    }`}>
                      {order.status === 'pending' ? 'À traiter' :
                       order.status === 'processing' ? 'En préparation' :
                       order.status === 'shipped' ? 'Expédiée' : 'Livrée'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
