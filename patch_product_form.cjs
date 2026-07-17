const fs = require('fs');
let code = fs.readFileSync('src/pages/seller/SellerProductFormPage.tsx', 'utf8');

if (!code.includes("import { Button }")) {
  code = code.replace(
    "import { Plus, Minus, Upload, Trash2, ArrowLeft, Save, CheckCircle2, Loader2, X } from 'lucide-react';",
    "import { Plus, Minus, Upload, Trash2, ArrowLeft, Save, CheckCircle2, Loader2, X } from 'lucide-react';\nimport { Button } from '../../components/ui/Button';"
  );
}

code = code.replace(
  /<button\s+onClick=\{\(\) => handleSave\('draft'\)\}\s+className="px-4 py-2 bg-surface border border-border-light text-text-primary font-medium rounded-xl hover:bg-border-light transition-colors flex items-center"\s*>\s*<Save className="h-4 w-4 mr-2" \/>\s*Brouillon\s*<\/button>/,
  `<Button variant="secondary" onClick={() => handleSave('draft')} isLoading={isSaving}>\n            <Save className="h-4 w-4 mr-2" /> Brouillon\n          </Button>`
);

code = code.replace(
  /<button\s+onClick=\{\(\) => handleSave\('active'\)\}\s+className="px-4 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent-hover transition-colors flex items-center"\s*>\s*<CheckCircle2 className="h-4 w-4 mr-2" \/>\s*Publier\s*<\/button>/,
  `<Button variant="primary" onClick={() => handleSave('active')} isLoading={isSaving}>\n            <CheckCircle2 className="h-4 w-4 mr-2" /> Publier\n          </Button>`
);

fs.writeFileSync('src/pages/seller/SellerProductFormPage.tsx', code);
