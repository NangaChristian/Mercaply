const fs = require('fs');
let content = fs.readFileSync('server/routes/payments.ts', 'utf-8');

// Replace static FAPSHI variables with dynamic from config
content = content.replace('import { supabaseAdmin } from "../supabase.js";', 'import { supabaseAdmin } from "../supabase.js";\nimport { getConfig } from "../services/config.js";\nimport { sendOrderConfirmationEmail } from "../services/email.js";');

const helperReplacement = `// Helper for Fapshi Requests
async function getFapshiConfig() {
  const config = getConfig();
  const fapshiInt = config.integrations.find((i: any) => i.id === 'fapshi');
  if (!fapshiInt || !fapshiInt.isActive) {
    throw new Error('Fapshi integration is disabled or not configured');
  }
  return fapshiInt.config;
}

async function fapshiRequest(endpoint: string, data: any) {
  const fapshiConfig = await getFapshiConfig();
  const response = await fetch(\`\${fapshiConfig.baseUrl}\${endpoint}\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apiuser": fapshiConfig.apiUser,
      "apikey": fapshiConfig.apiKey,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function fapshiGet(endpoint: string) {
  const fapshiConfig = await getFapshiConfig();
  const response = await fetch(\`\${fapshiConfig.baseUrl}\${endpoint}\`, {
    headers: {
      "apiuser": fapshiConfig.apiUser,
      "apikey": fapshiConfig.apiKey,
    },
  });
  return response.json();
}`;

content = content.replace(/const FAPSHI_USER_ID[\s\S]*?return response.json\(\);\n\}/, helperReplacement);

// Replace get commission with getConfig commission
content = content.replace(/const { data: settings } = await supabaseAdmin.from\('admin_settings'\).select\('commission_percentage'\).eq\('id', 1\).single\(\);\n\s*const commPercent = settings\?.commission_percentage \|\| 5\.0;/, `const config = getConfig();\n    const commPercent = config.commission_percentage || 5.0;`);

// In the webhook, update to send email
content = content.replace(/await supabaseAdmin\.from\('orders'\)\.update\(\{ payment_status: 'paid', status: 'processing' \}\)\.eq\('id', externalId\);/, 
  `await supabaseAdmin.from('orders').update({ payment_status: 'paid', status: 'processing' }).eq('id', externalId);\n        \n        // Send order confirmation email\n        const { data: buyer } = await supabaseAdmin.from('profiles').select('email, first_name').eq('id', order.buyer_id).single();\n        if (buyer && buyer.email) {\n          await sendOrderConfirmationEmail(buyer.email, buyer.first_name, order);\n        }`);

fs.writeFileSync('server/routes/payments.ts', content);
