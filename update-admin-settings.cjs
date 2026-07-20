const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminSettingsPage.tsx', 'utf-8');

// Add import
content = content.replace("import { AdminShippingZones } from '../../components/admin/AdminShippingZones';", "import { AdminShippingZones } from '../../components/admin/AdminShippingZones';\nimport { AdminIntegrations } from '../../components/admin/AdminIntegrations';");

// Remove old Key card
const oldCardRegex = /<Card className="p-6">\s*<div className="flex items-center gap-3 mb-6">\s*<Key className="h-6 w-6 text-blue-500" \/>\s*<h2 className="text-lg font-bold text-text-primary">Clés API & Intégrations<\/h2>\s*<\/div>[\s\S]*?<\/Card>/;

content = content.replace(oldCardRegex, '<AdminIntegrations />');

fs.writeFileSync('src/pages/admin/AdminSettingsPage.tsx', content);
