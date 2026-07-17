const fs = require('fs');
let code = fs.readFileSync('src/pages/seller/SellerServiceFormPage.tsx', 'utf8');

if (!code.includes("import { Button }")) {
  code = code.replace(
    "import { cn } from '../../utils/cn';",
    "import { cn } from '../../utils/cn';\nimport { Button } from '../../components/ui/Button';"
  );
}

code = code.replace(
  /<button\s+type="submit"[\s\S]*?<\/button>/,
  `<Button type="submit" variant="primary" isLoading={isSaving}>\n            Enregistrer\n          </Button>`
);

fs.writeFileSync('src/pages/seller/SellerServiceFormPage.tsx', code);
