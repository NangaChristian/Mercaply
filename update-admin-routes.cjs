const fs = require('fs');
let content = fs.readFileSync('server/routes/admin.ts', 'utf-8');

// Add imports
content = content.replace('import { supabaseAdmin } from "../supabase.js";', 'import { supabaseAdmin } from "../supabase.js";\nimport { getConfig, saveConfig } from "../services/config.js";');

// Replace settings routes
const newSettingsRoute = `// Settings (commission and integrations)
router.get("/settings", async (req, res) => {
  const config = getConfig();
  res.json(config);
});

router.put("/settings", async (req, res) => {
  const currentConfig = getConfig();
  const newConfig = { ...currentConfig, ...req.body };
  saveConfig(newConfig);
  res.json({ success: true, config: newConfig });
});

router.put("/integrations/:id", async (req, res) => {
  const currentConfig = getConfig();
  const integrationId = req.params.id;
  
  const integrations = currentConfig.integrations.map(int => {
    if (int.id === integrationId) {
      return { ...int, ...req.body };
    }
    return int;
  });
  
  // If it's a new integration that doesn't exist, we could add it, but for now we only support the built-in ones.
  const newConfig = { ...currentConfig, integrations };
  saveConfig(newConfig);
  res.json({ success: true, integration: integrations.find(i => i.id === integrationId) });
});
`;

content = content.replace(/\/\/ Settings \(commission\)[\s\S]*?export default router;/, newSettingsRoute + '\nexport default router;');

fs.writeFileSync('server/routes/admin.ts', content);
