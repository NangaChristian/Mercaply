const fs = require('fs');
let code = fs.readFileSync('src/pages/buyer/BuyerAddressesPage.tsx', 'utf8');

if (!code.includes("import { Button }")) {
  code = code.replace(
    "import { supabase } from '../../lib/supabase';",
    "import { supabase } from '../../lib/supabase';\nimport { Button } from '../../components/ui/Button';"
  );
}

code = code.replace(
  /<button\s+type="submit"\s+disabled=\{isSaving\}\s+className="px-6 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors flex items-center disabled:opacity-70"\s*>\s*\{isSaving \? <Loader2 className="w-4 h-4 mr-2 animate-spin" \/> : null\}\s*Enregistrer\s*<\/button>/,
  `<Button type="submit" variant="primary" isLoading={isSaving}>\n                Enregistrer\n              </Button>`
);

fs.writeFileSync('src/pages/buyer/BuyerAddressesPage.tsx', code);
