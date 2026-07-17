const fs = require('fs');
let code = fs.readFileSync('src/components/product/ProductReviews.tsx', 'utf8');

code = code.replace(
  "import { cn } from '../../utils/cn';",
  "import { cn } from '../../utils/cn';\nimport { Button } from '../ui/Button';"
);

code = code.replace(
  /<button\s+type="submit"[\s\S]*?<\/button>/,
  `<Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!comment.trim()}>\n                    Publier mon avis\n                  </Button>`
);

fs.writeFileSync('src/components/product/ProductReviews.tsx', code);
