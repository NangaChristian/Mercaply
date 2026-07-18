const fs = require('fs');
let content = fs.readFileSync('src/components/product/ProductReviews.tsx', 'utf-8');

const targetStr = `        // Check products in orders
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const orderSnaps = await getDocs(q);
        let found = false;
        
        for (const doc of orderSnaps.docs) {
          const order = doc.data();
          if (order.items && order.items.some((item: any) => item.productId === productId)) {
            found = true;
            break;
          }
        }
        
        if (!found) {
          // Check service requests
          const sq = query(collection(db, 'serviceRequests'), where('buyerId', '==', user.uid), where('serviceId', '==', productId));
          const serviceSnaps = await getDocs(sq);
          if (!serviceSnaps.empty) {
            found = true;
          }
        }`;

const replacementStr = `        // Check products in orders
        let found = false;
        const { data: orders } = await supabase.from('orders').select('*').eq('buyer_id', user.uid);
        if (orders) {
          for (const order of orders) {
            // Check if items contains the productId. Wait, the structure of order items:
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
            if (items.some((item: any) => item.productId === productId || item.product_id === productId)) {
              found = true;
              break;
            }
          }
        }
        
        if (!found) {
          // Check service requests
          const { data: serviceRequests } = await supabase.from('service_requests').select('*').eq('buyer_id', user.uid).eq('service_id', productId);
          if (serviceRequests && serviceRequests.length > 0) {
            found = true;
          }
        }`;

content = content.replace(targetStr, replacementStr);

fs.writeFileSync('src/components/product/ProductReviews.tsx', content, 'utf-8');
