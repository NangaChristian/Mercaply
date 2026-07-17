const fs = require('fs');
let code = fs.readFileSync('src/pages/seller/SellerSettingsPage.tsx', 'utf8');

if (!code.includes("import { Button }")) {
  code = code.replace(
    "import { useAuth } from '../../store/useAuth';",
    "import { useAuth } from '../../store/useAuth';\nimport { Button } from '../../components/ui/Button';"
  );
}

code = code.replace(
  /<button\s+onClick=\{handleSave\}\s+disabled=\{isSaving\}\s+className="px-6 py-2\.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors flex items-center disabled:opacity-70"\s*>\s*\{isSaving \? <Loader2 className="h-5 w-5 mr-2 animate-spin" \/> : <Save className="h-5 w-5 mr-2" \/>\}\s*Enregistrer\s*<\/button>/,
  `<Button onClick={handleSave} variant="primary" isLoading={isSaving}>\n          <Save className="h-5 w-5 mr-2" /> Enregistrer\n        </Button>`
);

fs.writeFileSync('src/pages/seller/SellerSettingsPage.tsx', code);
