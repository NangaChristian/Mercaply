const fs = require('fs');
let code = fs.readFileSync('src/components/product/ProductReviews.tsx', 'utf8');

code = code.replace(
  "import { useEffect } from 'react';",
  "import { useEffect } from 'react';\nimport { supabase } from '../../lib/supabase';"
);

code = code.replace(
  /const q = query\(collection\(db, 'orders'\), where\('userId', '==', user\.uid\)\);\n        const orderSnaps = await getDocs\(q\);\n        let found = false;\n        \n        for \(const doc of orderSnaps\.docs\) \{\n          const order = doc\.data\(\);\n          if \(order\.items && order\.items\.some\(\(item: any\) => item\.productId === productId\)\) \{\n            found = true;\n            break;\n          \}\n        \}\n        \n        if \(!found\) \{\n          const sq = query\(collection\(db, 'service_orders'\), where\('buyerId', '==', user\.uid\)\);\n          const serviceSnaps = await getDocs\(sq\);\n          for \(const doc of serviceSnaps\.docs\) \{\n            const order = doc\.data\(\);\n            if \(order\.serviceId === productId\) \{\n              found = true;\n              break;\n            \}\n          \}\n        \}/,
  `
        let found = false;
        
        // Use Supabase
        if (supabase) {
           const { data: orders } = await supabase.from('orders').select('*').eq('buyerId', user.uid);
           if (orders) {
              for (const order of orders) {
                 if (order.items && order.items.some((item: any) => item.productId === productId)) {
                    found = true;
                    break;
                 }
              }
           }
        }
  `
);

fs.writeFileSync('src/components/product/ProductReviews.tsx', code);
