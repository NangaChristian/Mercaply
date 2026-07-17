const fs = require('fs');
let code = fs.readFileSync('src/pages/seller/SellerStorePage.tsx', 'utf8');

if (!code.includes("import { Button }")) {
  code = code.replace(
    "import { uploadFile } from '../../utils/uploadFile';",
    "import { uploadFile } from '../../utils/uploadFile';\nimport { Button } from '../../components/ui/Button';"
  );
}

code = code.replace(
  /<button\s+onClick=\{handleSave\}\s+disabled=\{isSaving\}\s+className="flex items-center px-6 py-2\.5 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-70"\s*>\s*\{isSaving \? \(\s*<Loader2 className="h-5 w-5 mr-2 animate-spin" \/>\s*\) : \(\s*<Save className="h-5 w-5 mr-2" \/>\s*\)\}\s*Enregistrer les modifications\s*<\/button>/,
  `<Button onClick={handleSave} variant="primary" isLoading={isSaving}>\n          <Save className="h-5 w-5 mr-2" /> Enregistrer les modifications\n        </Button>`
);

fs.writeFileSync('src/pages/seller/SellerStorePage.tsx', code);
