const fs = require('fs');
let content = fs.readFileSync('src/pages/seller/SellerOrdersPage.tsx', 'utf-8');

// We need to add handleUpdateStatus
const importReplacement = `import { useState, useEffect } from 'react';
import { Search, Filter, Package, Clock, CheckCircle2, XCircle, Truck, Eye } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../store/useAuth';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../store/useToast';`;

content = content.replace(/import { useState[^;]+;/, importReplacement);

const hooksReplacement = `  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    // Already fetched in useOrders, but if we need a refetch mechanism we can pass it or just reload
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdating(orderId);
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(\`/api/orders/\${orderId}/status\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${session?.access_token}\`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      
      addToast('success', 'Statut mis à jour avec succès');
      // Update local state if needed, but since it relies on realtime or re-mount...
      window.location.reload(); // Simple way to refresh
    } catch (err: any) {
      addToast('error', err.message);
    } finally {
      setIsUpdating(null);
    }
  };`;

content = content.replace("const [searchQuery, setSearchQuery] = useState('');", hooksReplacement);

const buttonConfirmReplacement = `{order.status === 'pending' && (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'processing')}
                      disabled={isUpdating === order.id}
                      className="flex-1 lg:flex-none py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover transition-colors">
                      {isUpdating === order.id ? '...' : 'Confirmer'}
                    </button>
                  )}`;
content = content.replace(/\{order\.status === 'pending' && \(\s*<button className="flex-1 lg:flex-none py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover transition-colors">\s*Confirmer\s*<\/button>\s*\)\}/, buttonConfirmReplacement);

const buttonShipReplacement = `{order.status === 'processing' && (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'shipped')}
                      disabled={isUpdating === order.id}
                      className="flex-1 lg:flex-none py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors">
                      {isUpdating === order.id ? '...' : 'Marquer expédié'}
                    </button>
                  )}`;
content = content.replace(/\{order\.status === 'processing' && \(\s*<button className="flex-1 lg:flex-none py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors">\s*Marquer expédié\s*<\/button>\s*\)\}/, buttonShipReplacement);

fs.writeFileSync('src/pages/seller/SellerOrdersPage.tsx', content);
