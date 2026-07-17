const fs = require('fs');
let code = fs.readFileSync('src/pages/shared/VerificationPage.tsx', 'utf8');

code = code.replace(
  "import { useNavigate } from 'react-router-dom';",
  "import { useNavigate } from 'react-router-dom';\nimport { Button } from '../../components/ui/Button';"
);

code = code.replace(
  /<button\s+type="submit"[\s\S]*?<\/button>/,
  `<Button type="submit" className="w-full py-4 text-base" isLoading={isUploading} disabled={!files.cniFront || !files.cniBack} variant="primary">\n              Soumettre les documents\n            </Button>`
);

fs.writeFileSync('src/pages/shared/VerificationPage.tsx', code);
