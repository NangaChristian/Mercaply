const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf-8');

const targetStr = `        // Since firestore doesn't do ilike natively well, we'll fetch some products and filter locally for a quick inline search
        const productsSnap = await getDocs(query(collection(db, 'products'), limit(50)));
        const servicesSnap = await getDocs(query(collection(db, 'services'), limit(50)));
        
        const allProducts = productsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any), type: 'product' }));
        const allServices = servicesSnap.docs.map(d => ({ id: d.id, ...(d.data() as any), type: 'service' }));
        
        const combined = [...allProducts, ...allServices];`;

const replacementStr = `        const { data: allProductsData } = await supabase.from('products').select('*').limit(50);
        const { data: allServicesData } = await supabase.from('services').select('*').limit(50);
        
        const allProducts = (allProductsData || []).map(d => ({ ...d, type: 'product' }));
        const allServices = (allServicesData || []).map(d => ({ ...d, type: 'service' }));
        
        const combined = [...allProducts, ...allServices];`;

content = content.replace(targetStr, replacementStr);

fs.writeFileSync('src/components/layout/Header.tsx', content, 'utf-8');
