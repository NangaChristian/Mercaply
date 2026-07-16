const fs = require('fs');
let code = fs.readFileSync('src/pages/buyer/BuyerAddressesPage.tsx', 'utf8');

code = code.replace(/import \{ useAuth \} from '\.\.\/\.\.\/store\/useAuth';/, "import { useAuth } from '../../store/useAuth';\nimport { supabase } from '../../lib/supabase';");
code = code.replace(/const \{ firebaseUser: user \} = useAuth\(\);/g, "const { user } = useAuth();");

code = code.replace(/const docRef = doc\(db, 'users', user\.uid\);\s*const docSnap = await getDoc\(docRef\);\s*if \(docSnap\.exists\(\)\) \{\s*const data = docSnap\.data\(\);\s*if \(data\.addresses\) \{\s*setAddresses\(data\.addresses\);\s*\}\s*\}/g, `
        const { data } = await supabase.from('profiles').select('addresses').eq('id', user.uid).single();
        if (data && data.addresses) {
          setAddresses(data.addresses);
        }`);

code = code.replace(/await updateDoc\(doc\(db, 'users', user\.uid\), \{\s*addresses: updatedAddresses\s*\}\);/g, `
      await supabase.from('profiles').update({ addresses: updatedAddresses }).eq('id', user.uid);`);

fs.writeFileSync('src/pages/buyer/BuyerAddressesPage.tsx', code);
