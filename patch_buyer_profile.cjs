const fs = require('fs');
let code = fs.readFileSync('src/pages/buyer/BuyerProfilePage.tsx', 'utf8');

if (!code.includes("import { Button }")) {
  code = code.replace(
    "import { Link } from 'react-router-dom';",
    "import { Link } from 'react-router-dom';\nimport { Button } from '../../components/ui/Button';"
  );
}

code = code.replace(
  /<button\s+type="submit"\s+disabled=\{isSaving\}\s+className="px-6 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors flex items-center disabled:opacity-70"\s*>\s*\{isSaving \? \(\s*<Loader2 className="w-5 h-5 mr-2 animate-spin" \/>\s*\) : \(\s*<Save className="h-4 w-4 mr-2" \/>\s*\)\}\s*Enregistrer les modifications\s*<\/button>/,
  `<Button type="submit" variant="primary" isLoading={isSaving}>\n                  <Save className="h-4 w-4 mr-2" /> Enregistrer les modifications\n                </Button>`
);

fs.writeFileSync('src/pages/buyer/BuyerProfilePage.tsx', code);
